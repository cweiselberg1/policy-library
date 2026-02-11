'use client';

import { useState, useEffect } from 'react';
import {
  RISK_CATEGORIES,
  RiskResponse,
  RiskCategoryResult,
  RiskAssessmentReport,
  analyzeRiskAssessment,
  exportRiskAssessmentMarkdown,
  exportRiskRegisterCSV,
  RiskCategory,
  RiskLikelihood,
  RiskImpact,
  calculateRiskLevel,
  calculateRiskScore,
} from '@/lib/it-risk-assessment';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useAnalytics } from '@/lib/mixpanel';

const STORAGE_KEY = 'hipaa-it-risk-assessment';

export default function ITRiskAssessmentClient() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, RiskResponse>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [report, setReport] = useState<RiskAssessmentReport | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showRiskMatrix, setShowRiskMatrix] = useState(false);
  const analytics = useAnalytics();

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setNotes(data.notes || {});
        setCurrentCategoryIndex(data.currentCategoryIndex || 0);
        if (data.report) {
          setReport(data.report);
          setShowResults(true);
        }
      } catch (e) {
        console.error('Failed to load saved assessment progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const data = {
      responses,
      notes,
      currentCategoryIndex,
      report,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [responses, notes, currentCategoryIndex, report]);

  const currentCategory = RISK_CATEGORIES[currentCategoryIndex];

  const handleAnswer = (
    questionId: string,
    answer: 'yes' | 'no' | 'partial' | 'na',
    likelihood?: RiskLikelihood,
    impact?: RiskImpact
  ) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        likelihood,
        impact,
        notes: notes[questionId],
      },
    }));
  };

  const handleNoteChange = (questionId: string, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [questionId]: note,
    }));
  };

  const getCategoryProgress = (category: RiskCategory) => {
    const answered = category.questions.filter((q) => responses[q.id]).length;
    return (answered / category.questions.length) * 100;
  };

  const getTotalProgress = () => {
    const totalQuestions = RISK_CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const goToNextCategory = () => {
    if (currentCategoryIndex < RISK_CATEGORIES.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToCategory = (index: number) => {
    setCurrentCategoryIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeAssessment = () => {
    analytics?.track('IT Risk Assessment Completed', {
      total_questions: Object.keys(responses).length,
      completion_percentage: getTotalProgress(),
    });

    const results: RiskCategoryResult[] = RISK_CATEGORIES.map((category) => ({
      categoryId: category.id,
      responses: category.questions
        .filter((q) => responses[q.id])
        .map((q) => responses[q.id]),
      completedAt: new Date().toISOString(),
    }));

    const newReport: RiskAssessmentReport = {
      results,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const analysis = analyzeRiskAssessment(results);
    newReport.overallRiskScore = analysis.overallRiskScore;
    newReport.riskDistribution = analysis.riskDistribution;

    setReport(newReport);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAssessment = () => {
    if (confirm('Are you sure you want to reset the assessment? All progress will be lost.')) {
      analytics?.track('IT Risk Assessment Reset');
      setResponses({});
      setNotes({});
      setCurrentCategoryIndex(0);
      setReport(null);
      setShowResults(false);
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exportReportMarkdown = () => {
    if (!report) return;

    analytics?.track('IT Risk Assessment Report Exported', {
      format: 'markdown',
      risk_score: report.overallRiskScore,
    });

    const markdown = exportRiskAssessmentMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `it-risk-assessment-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReportCSV = () => {
    if (!report) return;

    analytics?.track('IT Risk Assessment Report Exported', {
      format: 'csv',
      risk_score: report.overallRiskScore,
    });

    const csv = exportRiskRegisterCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-register-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getRiskLevelColor = (score: number): string => {
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevelText = (score: number): string => {
    if (score >= 20) return 'Critical Risk';
    if (score >= 12) return 'High Risk';
    if (score >= 6) return 'Medium Risk';
    return 'Low Risk';
  };

  if (showResults && report) {
    const analysis = analyzeRiskAssessment(report.results);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setShowResults(false)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Assessment
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Risk Assessment Results</h1>
                <p className="mt-2 text-slate-600">
                  Completed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportReportMarkdown}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export Report
                </button>
                <button
                  onClick={exportReportCSV}
                  className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Overall Risk Score Card */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overall Risk Score</p>
                <p className="mt-2 text-6xl font-bold text-slate-900">{analysis.overallRiskScore.toFixed(1)}</p>
                <p className="mt-2 text-lg text-slate-600">{getRiskLevelText(analysis.overallRiskScore)}</p>
                <p className="mt-1 text-sm text-slate-500">Scale: 1-5 (Low) | 6-11 (Medium) | 12-19 (High) | 20-25 (Critical)</p>
              </div>
              <div className={`flex h-32 w-32 items-center justify-center rounded-full ${
                analysis.overallRiskScore >= 20 ? 'bg-red-100' :
                analysis.overallRiskScore >= 12 ? 'bg-orange-100' :
                analysis.overallRiskScore >= 6 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {analysis.overallRiskScore >= 12 ? (
                  <FireIcon className={`h-16 w-16 ${
                    analysis.overallRiskScore >= 20 ? 'text-red-600' : 'text-orange-600'
                  }`} />
                ) : analysis.overallRiskScore >= 6 ? (
                  <ExclamationTriangleIcon className="h-16 w-16 text-yellow-600" />
                ) : (
                  <ShieldExclamationIcon className="h-16 w-16 text-green-600" />
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-700">{analysis.riskDistribution.critical}</p>
                <p className="text-sm text-red-600">Critical</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-2xl font-bold text-orange-700">{analysis.riskDistribution.high}</p>
                <p className="text-sm text-orange-600">High</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="text-2xl font-bold text-yellow-700">{analysis.riskDistribution.medium}</p>
                <p className="text-sm text-yellow-600">Medium</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-700">{analysis.riskDistribution.low}</p>
                <p className="text-sm text-green-600">Low</p>
              </div>
            </div>
          </div>

          {/* Risk Heat Map */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <button
              onClick={() => setShowRiskMatrix(!showRiskMatrix)}
              className="flex w-full items-center justify-between"
            >
              <h2 className="text-xl font-bold text-slate-900">Risk Heat Map</h2>
              {showRiskMatrix ? (
                <ChevronDownIcon className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {showRiskMatrix && (
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">Impact →<br/>Likelihood ↓</th>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">Very Low (1)</th>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">Low (2)</th>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">Medium (3)</th>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">High (4)</th>
                        <th className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold">Critical (5)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['very-high', 'high', 'medium', 'low', 'very-low'].map((likelihood) => (
                        <tr key={likelihood}>
                          <td className="border border-slate-300 bg-slate-100 p-2 text-xs font-semibold text-center">
                            {likelihood === 'very-high' ? 'Very High (5)' :
                             likelihood === 'high' ? 'High (4)' :
                             likelihood === 'medium' ? 'Medium (3)' :
                             likelihood === 'low' ? 'Low (2)' : 'Very Low (1)'}
                          </td>
                          {['very-low', 'low', 'medium', 'high', 'critical'].map((impact) => {
                            const score = calculateRiskScore(likelihood as RiskLikelihood, impact as RiskImpact);
                            const count = analysis.identifiedRisks.filter(
                              r => r.likelihood === likelihood && r.impact === impact
                            ).length;
                            return (
                              <td
                                key={impact}
                                className={`border border-slate-300 p-4 text-center ${getRiskLevelColor(score)} ${
                                  count > 0 ? 'font-bold text-white' : 'opacity-50'
                                }`}
                              >
                                <div className="text-lg">{count > 0 ? count : '-'}</div>
                                <div className="text-xs">{score}</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-slate-600">
                  Numbers in cells indicate count of identified risks at that likelihood/impact combination.
                  Cell colors represent risk level (Green=Low, Yellow=Medium, Orange=High, Red=Critical).
                </p>
              </div>
            )}
          </div>

          {/* Category Scores */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Category Risk Scores</h2>
            <div className="space-y-4">
              {RISK_CATEGORIES.map((category) => {
                const categoryScore = analysis.categoryScores[category.id] || 0;
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{category.title}</p>
                        <p className="text-xs text-slate-500">{category.description}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{categoryScore.toFixed(1)}</p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all ${getRiskLevelColor(categoryScore)}`}
                        style={{ width: `${Math.min((categoryScore / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prioritized Risks */}
          {analysis.identifiedRisks.length > 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Prioritized Remediation Plan ({analysis.identifiedRisks.length} Risks)
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                Risks are listed in priority order based on risk score (Likelihood × Impact).
                Address critical and high risks first.
              </p>

              <div className="space-y-4">
                {analysis.identifiedRisks.slice(0, 20).map((risk, index) => (
                  <div
                    key={`${risk.categoryId}-${risk.questionId}`}
                    className={`rounded-lg border-2 p-4 ${
                      risk.riskLevel === 'critical' ? 'border-red-300 bg-red-50' :
                      risk.riskLevel === 'high' ? 'border-orange-300 bg-orange-50' :
                      risk.riskLevel === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                      'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        risk.riskLevel === 'critical' ? 'bg-red-600' :
                        risk.riskLevel === 'high' ? 'bg-orange-600' :
                        risk.riskLevel === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      } text-white font-bold`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            risk.riskLevel === 'critical' ? 'bg-red-600 text-white' :
                            risk.riskLevel === 'high' ? 'bg-orange-600 text-white' :
                            risk.riskLevel === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          }`}>
                            {risk.riskLevel} Risk
                          </span>
                          <span className="text-xs text-slate-600">
                            Score: {risk.riskScore.toFixed(1)} | {risk.categoryTitle}
                          </span>
                        </div>
                        <p className="mb-2 font-semibold text-slate-900">{risk.question}</p>
                        <div className="mb-2 flex gap-4 text-xs text-slate-600">
                          <span>Likelihood: <strong>{risk.likelihood}</strong></span>
                          <span>Impact: <strong>{risk.impact}</strong></span>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-sm font-medium text-slate-700 mb-1">Remediation:</p>
                          <p className="text-sm text-slate-600">{risk.remediation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {analysis.identifiedRisks.length > 20 && (
                <p className="mt-4 text-center text-sm text-slate-600">
                  Showing top 20 risks. Export full report to see all {analysis.identifiedRisks.length} identified risks.
                </p>
              )}
            </div>
          )}

          {analysis.identifiedRisks.length === 0 && (
            <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <ShieldExclamationIcon className="mx-auto h-16 w-16 text-green-600" />
              <h3 className="mt-4 text-xl font-bold text-green-900">Excellent Security Posture</h3>
              <p className="mt-2 text-green-700">
                No significant risks identified. All security controls are in place and effective.
              </p>
            </div>
          )}

          {/* Detailed Responses */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Detailed Responses</h2>
            <div className="space-y-4">
              {RISK_CATEGORIES.map((category) => {
                const result = report.results.find((r) => r.categoryId === category.id);
                if (!result) return null;

                return (
                  <div key={category.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex w-full items-center justify-between py-2 text-left"
                    >
                      <h3 className="font-semibold text-slate-900">{category.title}</h3>
                      {expandedCategories[category.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </button>

                    {expandedCategories[category.id] && (
                      <div className="mt-2 space-y-3 pl-4">
                        {result.responses.map((response) => {
                          const question = category.questions.find((q) => q.id === response.questionId);
                          if (!question) return null;

                          return (
                            <div key={response.questionId} className="flex items-start gap-3 text-sm">
                              {response.answer === 'yes' && <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600" />}
                              {response.answer === 'no' && <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />}
                              {response.answer === 'partial' && <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-yellow-600" />}
                              {response.answer === 'na' && <span className="h-5 w-5 flex-shrink-0 text-slate-400">—</span>}
                              <div className="flex-1">
                                <p className="text-slate-900">{question.text}</p>
                                {response.notes && (
                                  <p className="mt-1 text-xs italic text-slate-600">Note: {response.notes}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowResults(false)}
              className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Continue Assessment
            </button>
            <button
              onClick={resetAssessment}
              className="flex-1 rounded-lg border-2 border-red-300 bg-white px-6 py-3 font-semibold text-red-700 hover:bg-red-50"
            >
              Reset Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">IT Risk Assessment Questionnaire</h1>
          <p className="mt-3 text-lg text-slate-600">
            Comprehensive security risk assessment covering all major IT security areas
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Based on NIST Risk Management Framework and HIPAA Security Rule requirements
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Overall Progress</p>
            <p className="text-sm font-bold text-blue-600">{Math.round(getTotalProgress())}%</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {Object.keys(responses).length} of {RISK_CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0)} questions answered
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Categories</h2>
              <nav className="space-y-2">
                {RISK_CATEGORIES.map((category, index) => {
                  const progress = getCategoryProgress(category);
                  const isActive = index === currentCategoryIndex;
                  return (
                    <button
                      key={category.id}
                      onClick={() => goToCategory(index)}
                      className={`w-full rounded-lg p-3 text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 ring-2 ring-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                          {category.title}
                        </p>
                        <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{category.questions.length} questions</p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full transition-all ${isActive ? 'bg-blue-600' : 'bg-slate-400'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 space-y-2">
                {getTotalProgress() === 100 && (
                  <button
                    onClick={completeAssessment}
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg"
                  >
                    Complete Assessment
                  </button>
                )}
                <button
                  onClick={resetAssessment}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset Progress
                </button>
              </div>
            </div>

            {/* Save Indicator */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ClockIcon className="h-4 w-4" />
                <span>Progress auto-saved</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-md">
            {/* Category Header */}
            <div className="mb-8 border-b border-slate-200 pb-6">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Category {currentCategoryIndex + 1} of {RISK_CATEGORIES.length}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{currentCategory.title}</h2>
              <p className="mt-3 text-slate-600">{currentCategory.description}</p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {currentCategory.questions.map((question, index) => {
                const response = responses[question.id];
                const showRiskInputs = response?.answer === 'no' || response?.answer === 'partial';

                return (
                  <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-slate-900">{question.text}</p>
                      <p className="mt-2 text-sm text-slate-600">{question.guidance}</p>
                    </div>

                    {/* Answer Buttons */}
                    <div className="mb-4 grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleAnswer(question.id, 'yes')}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                          response?.answer === 'yes'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-green-400'
                        }`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer(question.id, 'no', question.defaultLikelihood, question.defaultImpact)}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                          response?.answer === 'no'
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-red-400'
                        }`}
                      >
                        <XCircleIcon className="h-4 w-4" />
                        No
                      </button>
                      <button
                        onClick={() => handleAnswer(question.id, 'partial', question.defaultLikelihood, question.defaultImpact)}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                          response?.answer === 'partial'
                            ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-yellow-400'
                        }`}
                      >
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        Partial
                      </button>
                      <button
                        onClick={() => handleAnswer(question.id, 'na')}
                        className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                          response?.answer === 'na'
                            ? 'border-slate-600 bg-slate-100 text-slate-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        N/A
                      </button>
                    </div>

                    {/* Risk Assessment Inputs (only for No/Partial answers) */}
                    {showRiskInputs && (
                      <div className="mb-4 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                        <p className="mb-3 text-sm font-semibold text-orange-900">
                          Assess the risk of this gap:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-medium text-slate-700">
                              Likelihood
                            </label>
                            <select
                              value={response.likelihood || question.defaultLikelihood}
                              onChange={(e) => handleAnswer(
                                question.id,
                                response.answer,
                                e.target.value as RiskLikelihood,
                                response.impact || question.defaultImpact
                              )}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="very-low">Very Low</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="very-high">Very High</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-medium text-slate-700">
                              Impact
                            </label>
                            <select
                              value={response.impact || question.defaultImpact}
                              onChange={(e) => handleAnswer(
                                question.id,
                                response.answer,
                                response.likelihood || question.defaultLikelihood,
                                e.target.value as RiskImpact
                              )}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            >
                              <option value="very-low">Very Low</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>
                        </div>
                        {response.likelihood && response.impact && (
                          <div className="mt-3 rounded-lg bg-white p-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Risk Level: <span className={`${
                                calculateRiskLevel(response.likelihood, response.impact) === 'critical' ? 'text-red-700' :
                                calculateRiskLevel(response.likelihood, response.impact) === 'high' ? 'text-orange-700' :
                                calculateRiskLevel(response.likelihood, response.impact) === 'medium' ? 'text-yellow-700' :
                                'text-green-700'
                              }`}>
                                {calculateRiskLevel(response.likelihood, response.impact).toUpperCase()}
                              </span> (Score: {calculateRiskScore(response.likelihood, response.impact)})
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label htmlFor={`notes-${question.id}`} className="mb-1 block text-sm font-medium text-slate-700">
                        Notes (optional)
                      </label>
                      <textarea
                        id={`notes-${question.id}`}
                        value={notes[question.id] || ''}
                        onChange={(e) => handleNoteChange(question.id, e.target.value)}
                        placeholder="Add any relevant notes or context..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={goToPreviousCategory}
                disabled={currentCategoryIndex === 0}
                className="rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {currentCategoryIndex === RISK_CATEGORIES.length - 1 ? (
                <button
                  onClick={completeAssessment}
                  disabled={getTotalProgress() < 100}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Complete Assessment
                </button>
              ) : (
                <button
                  onClick={goToNextCategory}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
                >
                  Next Category
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
