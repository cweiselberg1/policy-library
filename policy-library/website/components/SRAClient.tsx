'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SRA_CATEGORIES,
  SRAResponse,
  SRACategoryResult,
  SRAReport,
  SRAQuestion,
  calculateSRAScore,
  exportSRAReportMarkdown,
  exportSRAReportCSV,
} from '@/lib/sra-assessment';
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  ListBulletIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { useAnalytics } from '@/lib/mixpanel';
import { orgStorage } from '@/lib/supabase/org-storage';

const STORAGE_KEY = 'hipaa-sra-assessment';

export default function SRAClient() {
  const [responses, setResponses] = useState<Record<string, SRAResponse>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [report, setReport] = useState<SRAReport | null>(null);
  const [showResults, setShowResults] = useState(false);
  const analytics = useAnalytics();

  // Flatten all questions into one list with category info
  const allQuestions = useMemo(
    () => SRA_CATEGORIES.flatMap((cat) => cat.questions),
    []
  );

  const yesNoCount = useMemo(
    () => allQuestions.filter((q) => q.type === 'yes-no').length,
    [allQuestions]
  );

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = orgStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setNotes(data.notes || {});
        if (data.report) {
          setReport(data.report);
          setShowResults(true);
        }
      } catch (e) {
        console.error('Failed to load saved SRA assessment progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    const data = {
      responses,
      notes,
      report,
      lastSaved: new Date().toISOString(),
    };
    orgStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [responses, notes, report]);

  const handleYesNo = (questionId: string, answer: 'yes' | 'no') => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        notes: notes[questionId],
      },
    }));
  };

  const handleMultipleChoice = (questionId: string, choice: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: choice,
        notes: notes[questionId],
      },
    }));
  };

  const handleFreeText = (questionId: string, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: text,
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

  const isQuestionAnswered = (question: SRAQuestion): boolean => {
    const response = responses[question.id];
    if (!response) return false;
    if (question.type === 'free-text') {
      return typeof response.answer === 'string' && response.answer.trim().length > 0;
    }
    return !!response.answer;
  };

  const getTotalProgress = () => {
    const answeredCount = allQuestions.filter((q) => isQuestionAnswered(q)).length;
    return (answeredCount / allQuestions.length) * 100;
  };

  const getAnsweredCount = () => {
    return allQuestions.filter((q) => isQuestionAnswered(q)).length;
  };

  const completeAssessment = () => {
    analytics?.track('SRA Assessment Completed', {
      total_questions: getAnsweredCount(),
      completion_percentage: getTotalProgress(),
    });

    const results: SRACategoryResult[] = SRA_CATEGORIES.map((category) => ({
      categoryId: category.id,
      responses: category.questions
        .filter((q) => responses[q.id])
        .map((q) => responses[q.id]),
      completedAt: new Date().toISOString(),
    }));

    const scoreData = calculateSRAScore(results);

    const newReport: SRAReport = {
      results,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      overallScore: scoreData.score,
      totalQuestions: scoreData.totalQuestions,
      compliantCount: scoreData.compliantCount,
      gapCount: scoreData.gapCount,
    };

    setReport(newReport);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAssessment = () => {
    if (confirm('Are you sure you want to reset the assessment? All progress will be lost.')) {
      analytics?.track('SRA Assessment Reset');
      setResponses({});
      setNotes({});
      setReport(null);
      setShowResults(false);
      orgStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exportReportMarkdown = () => {
    if (!report) return;

    analytics?.track('SRA Report Exported', {
      format: 'markdown',
      score: report.overallScore,
    });

    const markdown = exportSRAReportMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sra-assessment-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReportCSV = () => {
    if (!report) return;

    analytics?.track('SRA Report Exported', {
      format: 'csv',
      score: report.overallScore,
    });

    const csv = exportSRAReportCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sra-assessment-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getQuestionTypeIcon = (type: SRAQuestion['type']) => {
    switch (type) {
      case 'yes-no':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'multiple-choice':
        return <ListBulletIcon className="h-4 w-4" />;
      case 'free-text':
        return <PencilSquareIcon className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: SRAQuestion['type']) => {
    switch (type) {
      case 'yes-no':
        return 'Yes / No';
      case 'multiple-choice':
        return 'Multiple Choice';
      case 'free-text':
        return 'Written Response';
    }
  };

  // Find which category a question belongs to
  const getCategoryForQuestion = (questionId: string) => {
    return SRA_CATEGORIES.find((cat) =>
      cat.questions.some((q) => q.id === questionId)
    );
  };

  // ──────────────────────────────────────────────
  // RESULTS VIEW
  // ──────────────────────────────────────────────
  if (showResults && report) {
    const scoreData = calculateSRAScore(report.results);
    const scoreColor = scoreData.score >= 80 ? 'text-success' : scoreData.score >= 60 ? 'text-amber-600' : 'text-red-600';
    const scoreBg = scoreData.score >= 80 ? 'bg-success-tint' : scoreData.score >= 60 ? 'bg-amber-50' : 'bg-red-50';
    const scoreBorder = scoreData.score >= 80 ? 'border-evergreen-200' : scoreData.score >= 60 ? 'border-amber-200' : 'border-red-200';

    return (
      <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-white to-evergreen-50/30">
        {/* Branded Header */}
        <header className="border-b border-pearl-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-copper-600 to-copper-500 shadow-lg">
                  <ShieldCheckIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-copper-600">One Guy Consulting</p>
                  <p className="text-xs font-medium text-[--text-muted]">Healthcare Compliance Experts</p>
                </div>
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="flex items-center gap-2 rounded-lg border border-pearl-300 bg-white px-4 py-2 text-sm font-semibold text-[--text-secondary] transition-all hover:bg-pearl-50 hover:border-pearl-400"
              >
                Back to Assessment
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Assessment Complete
            </h1>
            <p className="mt-3 text-lg text-[--text-muted]">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Score Card */}
          <div className={`relative mb-12 overflow-hidden rounded-3xl border-2 ${scoreBorder} ${scoreBg} p-12 shadow-2xl`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-copper-600/10 to-evergreen-600/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-[--text-muted]">Compliance Score</p>
                  <p className="text-xs text-[--text-muted] mt-1">Based on {scoreData.totalScoredQuestions} Yes/No questions</p>
                  <p className={`mt-2 text-8xl font-black ${scoreColor}`}>
                    {Math.round(scoreData.score)}
                    <span className="text-5xl">%</span>
                  </p>
                  <p className="mt-4 text-lg font-semibold text-[--text-secondary]">
                    {scoreData.score >= 80
                      ? 'Strong Compliance Posture'
                      : scoreData.score >= 60
                      ? 'Moderate Risk - Action Required'
                      : 'High Risk - Immediate Attention Needed'}
                  </p>
                </div>
                <div className={`flex h-32 w-32 items-center justify-center rounded-full ${scoreBg} ring-4 ${scoreData.score >= 80 ? 'ring-evergreen-300' : scoreData.score >= 60 ? 'ring-amber-300' : 'ring-red-300'}`}>
                  {scoreData.score >= 80 ? (
                    <ShieldCheckIcon className="h-20 w-20 text-success" />
                  ) : (
                    <ExclamationTriangleIcon className="h-20 w-20 text-amber-600" />
                  )}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-4 gap-6">
                <div className="rounded-2xl border border-pearl-200 bg-white p-6 shadow-sm">
                  <p className="text-4xl font-bold text-evergreen-950">{scoreData.totalQuestions}</p>
                  <p className="mt-1 text-sm font-medium text-[--text-muted]">Total Answered</p>
                </div>
                <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-6 shadow-sm">
                  <p className="text-4xl font-bold text-copper-600">{scoreData.totalScoredQuestions}</p>
                  <p className="mt-1 text-sm font-medium text-copper-700">Scored (Yes/No)</p>
                </div>
                <div className="rounded-2xl border border-evergreen-200 bg-success-tint/50 p-6 shadow-sm">
                  <p className="text-4xl font-bold text-success">{scoreData.compliantCount}</p>
                  <p className="mt-1 text-sm font-medium text-evergreen-700">Compliant</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                  <p className="text-4xl font-bold text-red-600">{scoreData.gapCount}</p>
                  <p className="mt-1 text-sm font-medium text-red-700">Gaps Found</p>
                </div>
              </div>

              {/* Export Actions */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={exportReportMarkdown}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-copper-600 to-copper-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[--shadow-copper] transition-all hover:shadow-xl hover:shadow-copper-600/40 hover:scale-[1.02]"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export Markdown Report
                </button>
                <button
                  onClick={exportReportCSV}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-pearl-300 bg-white px-6 py-4 text-base font-semibold text-[--text-secondary] transition-all hover:bg-pearl-50 hover:border-pearl-400"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export CSV Data
                </button>
              </div>
            </div>
          </div>

          {/* Gap Analysis */}
          {scoreData.gaps.length > 0 ? (
            <div className="mb-12 rounded-2xl border border-pearl-200 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                    Gap Analysis & Remediation Plan
                  </h2>
                  <p className="mt-1 text-sm text-[--text-muted]">
                    {scoreData.gaps.length} item{scoreData.gaps.length !== 1 ? 's' : ''} require immediate attention
                  </p>
                </div>
                <div className="rounded-full bg-red-100 px-4 py-2">
                  <p className="text-sm font-bold text-red-700">Action Required</p>
                </div>
              </div>

              <div className="space-y-5">
                {scoreData.gaps.map((gap, index) => (
                  <div
                    key={`${gap.categoryId}-${gap.questionId}`}
                    className="group rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-6 transition-all hover:border-red-300 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-base font-bold text-white shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">{gap.categoryTitle}</p>
                        <p className="mb-4 text-lg font-bold text-evergreen-950 whitespace-pre-line">{gap.questionText}</p>
                        <div className="rounded-lg border border-pearl-200 bg-white p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wide text-[--text-muted] mb-2">Recommended Action</p>
                          <p className="text-base leading-relaxed text-[--text-secondary]">{gap.remediation}</p>
                        </div>
                        {gap.notes && (
                          <div className="mt-3 rounded-lg bg-pearl-50 p-3">
                            <p className="text-xs font-semibold text-[--text-muted]">Your Notes</p>
                            <p className="mt-1 text-sm italic text-[--text-muted]">{gap.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-12 rounded-2xl border-2 border-evergreen-200 bg-gradient-to-br from-evergreen-50 to-white p-12 text-center shadow-xl">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-evergreen-700 to-evergreen-600 shadow-2xl">
                <ShieldCheckIcon className="h-14 w-14 text-white" />
              </div>
              <h3 className="mt-6 text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>Perfect Compliance</h3>
              <p className="mt-2 text-lg text-[--text-muted]">
                No gaps identified. All assessed security controls are in place and functioning.
              </p>
            </div>
          )}

          {/* Detailed Responses */}
          <div className="mb-12 rounded-2xl border border-pearl-200 bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>Detailed Assessment Responses</h2>
            <div className="space-y-3">
              {allQuestions.map((question) => {
                const response = responses[question.id];
                if (!response) return null;
                const category = getCategoryForQuestion(question.id);

                return (
                  <div key={question.id} className="flex items-start gap-3 rounded-lg border border-pearl-100 bg-pearl-50/50 p-4 text-sm transition-all hover:bg-pearl-50">
                    {question.type === 'yes-no' ? (
                      response.answer === 'yes' ? (
                        <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-success" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 flex-shrink-0 text-red-500" />
                      )
                    ) : question.type === 'multiple-choice' ? (
                      <ListBulletIcon className="h-6 w-6 flex-shrink-0 text-copper-500" />
                    ) : (
                      <ChatBubbleBottomCenterTextIcon className="h-6 w-6 flex-shrink-0 text-[--text-muted]" />
                    )}
                    <div className="flex-1">
                      {category && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-[--text-muted] mb-1">{category.title}</p>
                      )}
                      <p className="font-medium text-evergreen-950 whitespace-pre-line">{question.text}</p>
                      <div className="mt-2">
                        {question.type === 'yes-no' ? (
                          <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                            response.answer === 'yes' ? 'bg-evergreen-100 text-evergreen-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {response.answer === 'yes' ? 'Yes' : 'No'}
                          </span>
                        ) : question.type === 'multiple-choice' ? (
                          <span className="inline-block rounded-full bg-copper-100 px-3 py-0.5 text-xs font-bold text-copper-700">
                            {response.answer}
                          </span>
                        ) : (
                          <p className="rounded bg-white px-3 py-2 text-sm text-[--text-secondary] border border-pearl-200 whitespace-pre-line">
                            {response.answer || '(No response provided)'}
                          </p>
                        )}
                      </div>
                      {response.notes && (
                        <p className="mt-2 rounded bg-white px-2 py-1 text-xs italic text-[--text-muted] border border-pearl-200">
                          Note: {response.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowResults(false)}
              className="flex-1 rounded-xl border-2 border-pearl-300 bg-white px-8 py-4 text-base font-semibold text-[--text-secondary] transition-all hover:bg-pearl-50 hover:border-pearl-400"
            >
              Back to Assessment
            </button>
            <button
              onClick={resetAssessment}
              className="flex-1 rounded-xl border-2 border-red-300 bg-white px-8 py-4 text-base font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-400"
            >
              Reset Assessment
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-evergreen-800 bg-evergreen-950">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-copper-600 to-copper-500">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pearl-50">One Guy Consulting</p>
                  <p className="text-xs text-evergreen-400">Healthcare Compliance Solutions</p>
                </div>
              </div>
              <p className="text-sm text-evergreen-400">
                &copy; 2026 One Guy Consulting. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // ASSESSMENT VIEW
  // ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-white to-evergreen-50/30">
      {/* Branded Header */}
      <header className="border-b border-pearl-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-copper-600 to-copper-500 shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-copper-600">One Guy Consulting</p>
              <p className="text-xs font-medium text-[--text-muted]">Healthcare Compliance Experts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-pearl-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-pearl-50 to-white" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-copper-600/10 to-evergreen-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight text-evergreen-950 sm:text-6xl" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Security Risk Assessment
            </h1>
            <p className="mt-6 text-xl leading-8 text-[--text-secondary]">
              Comprehensive HIPAA security evaluation with real-time compliance scoring and remediation guidance. Complete all {allQuestions.length} questions to receive your detailed assessment report.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:max-w-3xl">
            <div className="rounded-xl border border-copper-200 bg-copper-50/50 p-4 shadow-sm">
              <p className="text-2xl font-bold text-copper-600">{allQuestions.length}</p>
              <p className="mt-1 text-xs font-medium text-[--text-muted]">Total Questions</p>
            </div>
            <div className="rounded-xl border border-evergreen-200 bg-evergreen-50/50 p-4 shadow-sm">
              <p className="text-2xl font-bold text-evergreen-600">{SRA_CATEGORIES.length}</p>
              <p className="mt-1 text-xs font-medium text-[--text-muted]">Sections</p>
            </div>
            <div className="rounded-xl border border-copper-200 bg-copper-50/50 p-4 shadow-sm">
              <p className="text-2xl font-bold text-copper-600">{yesNoCount}</p>
              <p className="mt-1 text-xs font-medium text-[--text-muted]">Scored (Yes/No)</p>
            </div>
            <div className="rounded-xl border border-evergreen-200 bg-success-tint/50 p-4 shadow-sm">
              <p className="text-2xl font-bold text-success">Auto</p>
              <p className="mt-1 text-xs font-medium text-[--text-muted]">Saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-10 rounded-2xl border-2 border-copper-200 bg-white p-6 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[--text-secondary]">Assessment Progress</p>
              <p className="mt-1 text-xs text-[--text-muted]">
                {getAnsweredCount()} of {allQuestions.length} questions completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-copper-600">{Math.round(getTotalProgress())}%</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[--text-muted]">
                <ClockIcon className="h-3.5 w-3.5" />
                Auto-saved
              </div>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-pearl-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-copper-600 to-copper-500 shadow-lg transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </div>

        {/* All Questions - Flat scrollable list with section headers */}
        <div className="space-y-6">
          {(() => {
            let globalIndex = 0;
            return SRA_CATEGORIES.map((category) => (
              <div key={category.id}>
                {/* Section Header */}
                <div className="mb-4 mt-8 first:mt-0">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-evergreen-950 to-evergreen-900 px-6 py-4 shadow-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                      <ShieldCheckIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{category.title}</h2>
                      <p className="text-xs text-pearl-300">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Questions in this category */}
                <div className="space-y-6">
                  {category.questions.map((question) => {
                    globalIndex++;
                    const currentIndex = globalIndex;
                    const response = responses[question.id];
                    const answered = isQuestionAnswered(question);

                    return (
                      <div
                        key={question.id}
                        className={`group rounded-2xl border-2 transition-all ${
                          answered
                            ? 'border-copper-200 bg-white shadow-lg'
                            : 'border-pearl-200 bg-white shadow-sm hover:border-copper-200 hover:shadow-md'
                        }`}
                      >
                        <div className="p-6">
                          {/* Question Header */}
                          <div className="mb-5">
                            <div className="mb-3 flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                                answered
                                  ? 'bg-gradient-to-br from-copper-600 to-copper-500 text-white shadow-lg'
                                  : 'bg-pearl-200 text-[--text-muted]'
                              }`}>
                                {currentIndex}
                              </div>
                              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                question.type === 'yes-no'
                                  ? 'bg-evergreen-100 text-evergreen-700'
                                  : question.type === 'multiple-choice'
                                  ? 'bg-copper-100 text-copper-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {getQuestionTypeIcon(question.type)}
                                {getQuestionTypeLabel(question.type)}
                              </div>
                              {answered && (
                                <div className="rounded-full bg-copper-100 px-3 py-1">
                                  <p className="text-xs font-bold text-copper-700">Answered</p>
                                </div>
                              )}
                            </div>
                            <p className="text-lg font-bold text-evergreen-950 leading-relaxed whitespace-pre-line">{question.text}</p>
                          </div>

                          {/* Answer Input - varies by type */}
                          {question.type === 'yes-no' && (
                            <>
                              <div className="mb-5 flex gap-4">
                                <button
                                  onClick={() => handleYesNo(question.id, 'yes')}
                                  className={`group/btn flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 text-base font-bold transition-all ${
                                    response?.answer === 'yes'
                                      ? 'border-evergreen-500 bg-success-tint text-evergreen-700 shadow-lg shadow-evergreen-600/20'
                                      : 'border-pearl-300 bg-white text-[--text-secondary] hover:border-evergreen-400 hover:bg-success-tint hover:text-success hover:shadow-md'
                                  }`}
                                >
                                  <CheckCircleIcon className="h-6 w-6 transition-transform group-hover/btn:scale-110" />
                                  Yes
                                </button>
                                <button
                                  onClick={() => handleYesNo(question.id, 'no')}
                                  className={`group/btn flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 text-base font-bold transition-all ${
                                    response?.answer === 'no'
                                      ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-600/20'
                                      : 'border-pearl-300 bg-white text-[--text-secondary] hover:border-red-400 hover:bg-red-50 hover:text-red-600 hover:shadow-md'
                                  }`}
                                >
                                  <XCircleIcon className="h-6 w-6 transition-transform group-hover/btn:scale-110" />
                                  No
                                </button>
                              </div>

                            </>
                          )}

                          {question.type === 'multiple-choice' && question.options && (
                            <div className="mb-5 space-y-3">
                              {question.options.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleMultipleChoice(question.id, option)}
                                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-base font-medium transition-all ${
                                    response?.answer === option
                                      ? 'border-copper-500 bg-copper-50 text-copper-800 shadow-lg shadow-copper-600/15'
                                      : 'border-pearl-300 bg-white text-[--text-secondary] hover:border-copper-300 hover:bg-copper-50/50 hover:shadow-md'
                                  }`}
                                >
                                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                    response?.answer === option
                                      ? 'border-copper-500 bg-copper-500'
                                      : 'border-pearl-400'
                                  }`}>
                                    {response?.answer === option && (
                                      <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}

                          {question.type === 'free-text' && (
                            <div className="mb-5">
                              <textarea
                                value={response?.answer || ''}
                                onChange={(e) => handleFreeText(question.id, e.target.value)}
                                placeholder="Enter your response here..."
                                className="w-full rounded-xl border-2 border-pearl-200 bg-pearl-50 px-4 py-3 text-base text-evergreen-950 placeholder-pearl-400 transition-all focus:border-copper-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-copper-400/20"
                                rows={4}
                              />
                            </div>
                          )}

                          {/* Notes field for yes/no and multiple choice */}
                          {question.type !== 'free-text' && (
                            <textarea
                              id={`notes-${question.id}`}
                              value={notes[question.id] || ''}
                              onChange={(e) => handleNoteChange(question.id, e.target.value)}
                              placeholder="Add notes (optional)"
                              className="w-full rounded-xl border-2 border-pearl-200 bg-pearl-50 px-4 py-3 text-sm text-evergreen-950 placeholder-pearl-400 transition-all focus:border-copper-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-copper-400/20"
                              rows={2}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Bottom Actions */}
        <div className="mt-10 flex items-center justify-between rounded-2xl border-2 border-pearl-200 bg-white p-6 shadow-lg">
          <button
            onClick={resetAssessment}
            className="rounded-lg border border-pearl-300 bg-white px-5 py-2.5 text-sm font-semibold text-[--text-muted] transition-all hover:bg-pearl-50 hover:text-evergreen-950"
          >
            Reset Assessment
          </button>

          <button
            onClick={completeAssessment}
            disabled={getTotalProgress() < 100}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-copper-600 to-copper-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-[--shadow-copper] transition-all hover:shadow-xl hover:shadow-copper-600/40 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            Complete Assessment
            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-pearl-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-copper-600 to-copper-500">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-evergreen-950">One Guy Consulting</p>
                <p className="text-xs text-[--text-muted]">Healthcare Compliance Solutions</p>
              </div>
            </div>
            <p className="text-sm text-[--text-muted]">
              &copy; 2026 One Guy Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
