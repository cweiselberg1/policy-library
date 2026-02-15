'use client';

import { useState, useEffect } from 'react';
import {
  SecurityPosture,
  calculateSecurityPosture,
  savePostureSnapshot,
  getRatingColor,
  getScoreColor,
  getScoreRingColor,
} from '@/lib/security-posture';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-600 text-white' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-500 text-white' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-500 text-white' },
  low: { bg: 'bg-copper-50', text: 'text-copper-700', badge: 'bg-copper-500 text-white' },
  info: { bg: 'bg-pearl-50', text: 'text-dark-600', badge: 'bg-dark-400 text-white' },
};

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const colorClass = getScoreRingColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-dark-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={colorClass}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-dark-500">/ 100</span>
      </div>
    </div>
  );
}

export default function SecurityPostureDashboard() {
  const [posture, setPosture] = useState<SecurityPosture | null>(null);

  useEffect(() => {
    const calculated = calculateSecurityPosture();
    setPosture(calculated);
    savePostureSnapshot(calculated);
  }, []);

  if (!posture) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-dark-500">Loading security posture...</p>
      </div>
    );
  }

  const ratingColors = getRatingColor(posture.overallRating);
  const hasAnyAssessment = posture.assessments.some((a) => a.status === 'completed');

  return (
    <div className="min-h-screen bg-pearl-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-evergreen-900">Security Posture</h1>
          <p className="mt-2 text-dark-600">
            Unified view of your organization&apos;s security across all assessments
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="mb-8 rounded-2xl border border-dark-200 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-dark-500">
                Overall Security Posture
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`rounded-full px-4 py-1.5 text-lg font-bold ${ratingColors.bg} ${ratingColors.text} ${ratingColors.border} border`}>
                  {posture.overallRating}
                </span>
              </div>
              {!hasAnyAssessment && (
                <p className="mt-4 text-sm text-dark-500">
                  Complete at least one assessment to see your security score.
                </p>
              )}
              <p className="mt-4 text-xs text-dark-400">
                Score weights: SRA (30%) + IT Risk (30%) + Vulnerability Assessment (40%)
              </p>
            </div>
            <ScoreRing score={posture.overallScore} size={140} />
          </div>
        </div>

        {/* Assessment Status Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {posture.assessments.map((assessment) => {
            const statusColors = {
              'not-started': { bg: 'bg-pearl-100', text: 'text-dark-600', icon: 'text-dark-400' },
              'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'text-yellow-500' },
              'completed': { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' },
            };
            const colors = statusColors[assessment.status];

            // Determine link based on assessment name
            let href = '#';
            if (assessment.name.includes('SRA')) href = '/sra';
            else if (assessment.name.includes('IT Risk')) href = '/audit';
            else if (assessment.name.includes('Vulnerability')) href = '/assessment/vuln';

            return (
              <a
                key={assessment.key}
                href={href}
                className="group rounded-xl border border-dark-200 bg-white p-6 shadow-sm transition-all hover:border-copper-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-evergreen-900">{assessment.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {assessment.status === 'not-started' ? 'Not Started' :
                         assessment.status === 'in-progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  {assessment.score !== null ? (
                    <div className={`text-3xl font-bold ${getScoreColor(assessment.score)}`}>
                      {assessment.score}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-dark-300">—</div>
                  )}
                </div>
                {assessment.lastCompleted && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-dark-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Last: {new Date(assessment.lastCompleted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
                {assessment.findingsCount !== undefined && assessment.findingsCount > 0 && (
                  <p className="mt-1 text-xs text-dark-500">
                    {assessment.findingsCount} finding{assessment.findingsCount !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-copper-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Go to assessment <ChevronRightIcon className="h-3 w-3" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Top Risks */}
        {posture.topRisks.length > 0 && (
          <div className="mb-8 rounded-xl border border-dark-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-evergreen-900">
              Top 10 Risks Across All Assessments
            </h2>
            <div className="space-y-3">
              {posture.topRisks.map((risk, i) => {
                const colors = SEVERITY_COLORS[risk.severity] || SEVERITY_COLORS.info;
                return (
                  <div
                    key={risk.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 ${colors.bg}`}
                  >
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors.badge}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${colors.badge}`}>
                          {risk.severity}
                        </span>
                        <span className="text-xs text-dark-500">{risk.source}</span>
                      </div>
                      <p className="mt-1 font-medium text-evergreen-900">{risk.title}</p>
                      <p className="mt-1 text-sm text-dark-600">{risk.remediation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {posture.topRisks.length === 0 && hasAnyAssessment && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-green-600" />
            <h3 className="mt-4 text-xl font-bold text-green-900">No Active Risks</h3>
            <p className="mt-2 text-green-700">
              All assessments show a clean security posture. Keep up the good work!
            </p>
          </div>
        )}

        {/* Assessment History */}
        {posture.history.length > 1 && (
          <div className="mb-8 rounded-xl border border-dark-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-dark-700" />
              <h2 className="text-xl font-bold text-evergreen-900">Score History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200">
                    <th className="pb-2 text-left font-semibold text-dark-700">Date</th>
                    <th className="pb-2 text-right font-semibold text-dark-700">Overall</th>
                    <th className="pb-2 text-right font-semibold text-dark-700">SRA</th>
                    <th className="pb-2 text-right font-semibold text-dark-700">IT Risk</th>
                    <th className="pb-2 text-right font-semibold text-dark-700">Vuln</th>
                  </tr>
                </thead>
                <tbody>
                  {[...posture.history].reverse().slice(0, 15).map((entry) => (
                    <tr key={entry.date} className="border-b border-pearl-100">
                      <td className="py-2 text-dark-600">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className={`py-2 text-right font-bold ${getScoreColor(entry.score)}`}>{entry.score}</td>
                      <td className="py-2 text-right text-dark-600">{entry.sraScore ?? '—'}</td>
                      <td className="py-2 text-right text-dark-600">{entry.itRiskScore ?? '—'}</td>
                      <td className="py-2 text-right text-dark-600">{entry.vulnScore ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasAnyAssessment && (
          <div className="rounded-xl border border-dark-200 bg-white p-12 text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-dark-300" />
            <h3 className="mt-4 text-lg font-semibold text-dark-700">No Assessments Completed</h3>
            <p className="mt-2 text-sm text-dark-500">
              Complete at least one security assessment to see your unified posture score.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/sra"
                className="rounded-lg bg-copper-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copper-700"
              >
                Start SRA
              </a>
              <a
                href="/audit"
                className="rounded-lg border border-copper-600 bg-white px-4 py-2 text-sm font-semibold text-copper-600 hover:bg-copper-50"
              >
                Start IT Risk Assessment
              </a>
              <a
                href="/assessment/vuln"
                className="rounded-lg border border-copper-600 bg-white px-4 py-2 text-sm font-semibold text-copper-600 hover:bg-copper-50"
              >
                Import Vulnerability Scans
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
