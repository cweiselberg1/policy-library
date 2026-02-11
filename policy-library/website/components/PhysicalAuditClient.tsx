'use client';

import { useState, useEffect } from 'react';
import {
  AUDIT_SECTIONS,
  AuditResponse,
  AuditResult,
  AuditReport,
  calculateAuditScore,
  generateRecommendations,
  exportAuditReportMarkdown,
  AuditSection,
} from '@/lib/physical-audit';
import {
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAnalytics } from '@/lib/mixpanel';

const STORAGE_KEY = 'hipaa-physical-audit';

export default function PhysicalAuditClient() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, AuditResponse>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [report, setReport] = useState<AuditReport | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const analytics = useAnalytics();

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setNotes(data.notes || {});
        setCurrentSectionIndex(data.currentSectionIndex || 0);
        if (data.report) {
          setReport(data.report);
          setShowResults(true);
        }
      } catch (e) {
        console.error('Failed to load saved audit progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const data = {
      responses,
      notes,
      currentSectionIndex,
      report,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [responses, notes, currentSectionIndex, report]);

  const currentSection = AUDIT_SECTIONS[currentSectionIndex];

  const handleAnswer = (questionId: string, answer: 'yes' | 'no' | 'na') => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
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

  const getSectionProgress = (section: AuditSection) => {
    const answered = section.questions.filter((q) => responses[q.id]).length;
    return (answered / section.questions.length) * 100;
  };

  const getTotalProgress = () => {
    const totalQuestions = AUDIT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const goToNextSection = () => {
    if (currentSectionIndex < AUDIT_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeAudit = () => {
    // Track audit completion
    analytics?.track('Physical Audit Completed', {
      total_questions: Object.keys(responses).length,
      completion_percentage: getTotalProgress(),
    });

    const results: AuditResult[] = AUDIT_SECTIONS.map((section) => ({
      sectionId: section.id,
      responses: section.questions
        .filter((q) => responses[q.id])
        .map((q) => responses[q.id]),
      completedAt: new Date().toISOString(),
    }));

    const newReport: AuditReport = {
      results,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const { score, findings } = calculateAuditScore(results);
    newReport.score = score;
    newReport.findings = findings;

    setReport(newReport);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAudit = () => {
    if (confirm('Are you sure you want to reset the audit? All progress will be lost.')) {
      analytics?.track('Physical Audit Reset');
      setResponses({});
      setNotes({});
      setCurrentSectionIndex(0);
      setReport(null);
      setShowResults(false);
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exportReport = () => {
    if (!report) return;

    analytics?.track('Physical Audit Report Exported', {
      score: report.score,
      format: 'markdown',
    });

    const markdown = exportAuditReportMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipaa-physical-audit-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (showResults && report) {
    const { score, findings, sectionScores } = calculateAuditScore(report.results);
    const recommendations = generateRecommendations(report.results);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setShowResults(false)}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Audit
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Audit Results</h1>
                <p className="mt-2 text-slate-600">
                  Completed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export Report
              </button>
            </div>
          </div>

          {/* Score Card */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overall Compliance Score</p>
                <p className="mt-2 text-6xl font-bold text-slate-900">{score}%</p>
              </div>
              <div className={`flex h-32 w-32 items-center justify-center rounded-full ${score >= 80 ? 'bg-emerald-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                {score >= 80 ? (
                  <ShieldCheckIcon className="h-16 w-16 text-emerald-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-16 w-16 text-yellow-600" />
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-2xl font-bold text-emerald-700">{findings.compliant}</p>
                <p className="text-sm text-emerald-600">Compliant</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-700">{findings.gaps}</p>
                <p className="text-sm text-red-600">Gaps Identified</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-2xl font-bold text-slate-700">{findings.notApplicable}</p>
                <p className="text-sm text-slate-600">Not Applicable</p>
              </div>
            </div>
          </div>

          {/* Section Scores */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Section Scores</h2>
            <div className="space-y-4">
              {AUDIT_SECTIONS.map((section) => {
                const sectionScore = sectionScores[section.id] || 0;
                return (
                  <div key={section.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{section.title}</p>
                        <p className="text-xs text-slate-500">{section.cfr}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{Math.round(sectionScore)}%</p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all ${sectionScore >= 80 ? 'bg-emerald-500' : sectionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${sectionScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Recommendations</h2>
              <p className="mb-6 text-sm text-slate-600">
                The following gaps were identified and require remediation to achieve full HIPAA compliance.
              </p>

              <div className="space-y-6">
                {recommendations.map((rec, index) => (
                  <div
                    key={`${rec.sectionId}-${rec.questionId}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {rec.priority === 'high' ? 'Required' : 'Addressable'}
                          </span>
                          <span className="text-xs text-slate-500">{rec.cfr}</span>
                        </div>
                        <p className="mb-2 text-sm font-semibold text-slate-900">{rec.sectionTitle}</p>
                        <p className="mb-2 text-sm text-slate-700">
                          <span className="font-medium">Gap:</span> {rec.question}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Recommendation:</span> {rec.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Responses */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Detailed Responses</h2>
            <div className="space-y-4">
              {AUDIT_SECTIONS.map((section) => {
                const result = report.results.find((r) => r.sectionId === section.id);
                if (!result) return null;

                return (
                  <div key={section.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between py-2 text-left"
                    >
                      <h3 className="font-semibold text-slate-900">{section.title}</h3>
                      {expandedSections[section.id] ? (
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </button>

                    {expandedSections[section.id] && (
                      <div className="mt-2 space-y-3 pl-4">
                        {result.responses.map((response) => {
                          const question = section.questions.find((q) => q.id === response.questionId);
                          if (!question) return null;

                          return (
                            <div key={response.questionId} className="flex items-start gap-3 text-sm">
                              {response.answer === 'yes' && <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-600" />}
                              {response.answer === 'no' && <XCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />}
                              {response.answer === 'na' && <MinusCircleIcon className="h-5 w-5 flex-shrink-0 text-slate-400" />}
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
              Continue Audit
            </button>
            <button
              onClick={resetAudit}
              className="flex-1 rounded-lg border-2 border-red-300 bg-white px-6 py-3 font-semibold text-red-700 hover:bg-red-50"
            >
              Reset Audit
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
          <h1 className="text-4xl font-bold text-slate-900">HIPAA Physical Safeguards Audit</h1>
          <p className="mt-3 text-lg text-slate-600">
            Assess your organization's compliance with HIPAA §164.310 Physical Safeguards
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
            {Object.keys(responses).length} of {AUDIT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0)} questions answered
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Sections</h2>
              <nav className="space-y-2">
                {AUDIT_SECTIONS.map((section, index) => {
                  const progress = getSectionProgress(section);
                  const isActive = index === currentSectionIndex;
                  return (
                    <button
                      key={section.id}
                      onClick={() => goToSection(index)}
                      className={`w-full rounded-lg p-3 text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 ring-2 ring-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                          {section.title}
                        </p>
                        <span className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{section.cfr}</p>
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
                    onClick={completeAudit}
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg"
                  >
                    Complete Audit
                  </button>
                )}
                <button
                  onClick={resetAudit}
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
            {/* Section Header */}
            <div className="mb-8 border-b border-slate-200 pb-6">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Section {currentSectionIndex + 1} of {AUDIT_SECTIONS.length}</span>
                <span>•</span>
                <span>{currentSection.cfr}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{currentSection.title}</h2>
              <p className="mt-3 text-slate-600">{currentSection.description}</p>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {currentSection.questions.map((question, index) => {
                const response = responses[question.id];
                return (
                  <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                            {index + 1}
                          </span>
                          {question.required && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Required
                            </span>
                          )}
                          <span className="text-xs text-slate-500">{question.cfr}</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">{question.text}</p>
                        <p className="mt-2 text-sm text-slate-600">{question.guidance}</p>
                      </div>
                    </div>

                    {/* Answer Buttons */}
                    <div className="mb-4 flex gap-3">
                      <button
                        onClick={() => handleAnswer(question.id, 'yes')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                          response?.answer === 'yes'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer(question.id, 'no')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                          response?.answer === 'no'
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-red-400'
                        }`}
                      >
                        <XCircleIcon className="h-5 w-5" />
                        No
                      </button>
                      <button
                        onClick={() => handleAnswer(question.id, 'na')}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                          response?.answer === 'na'
                            ? 'border-slate-600 bg-slate-100 text-slate-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <MinusCircleIcon className="h-5 w-5" />
                        N/A
                      </button>
                    </div>

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
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className="rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {currentSectionIndex === AUDIT_SECTIONS.length - 1 ? (
                <button
                  onClick={completeAudit}
                  disabled={getTotalProgress() < 100}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Complete Audit
                </button>
              ) : (
                <button
                  onClick={goToNextSection}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
                >
                  Next Section
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
