/**
 * Security Posture Dashboard Library
 * Reads from multiple localStorage assessment sources to compute a unified security score
 * One Guy Consulting
 */

// ─── Data Models ───────────────────────────────────────────────

export interface AssessmentStatus {
  name: string;
  key: string;
  lastCompleted: string | null;
  score: number | null;        // 0-100 normalized
  status: 'not-started' | 'in-progress' | 'completed';
  findingsCount?: number;
}

export interface UnifiedRisk {
  id: string;
  source: string;              // 'SRA', 'IT Risk', 'Vulnerability Scan'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  remediation: string;
}

export interface SecurityPosture {
  overallScore: number;        // 0-100
  overallRating: string;       // 'Excellent', 'Good', 'Fair', 'Poor', 'Critical'
  assessments: AssessmentStatus[];
  topRisks: UnifiedRisk[];
  history: PostureHistoryEntry[];
  lastUpdated: string;
}

export interface PostureHistoryEntry {
  date: string;
  score: number;
  sraScore: number | null;
  itRiskScore: number | null;
  vulnScore: number | null;
}

// ─── Constants ─────────────────────────────────────────────────

const STORAGE_KEYS = {
  sra: 'hipaa-sra-assessment',
  itRisk: 'hipaa-it-risk-assessment',
  vuln: 'ogc-vuln-assessment',
  postureHistory: 'ogc-security-posture-history',
};

const WEIGHTS = {
  sra: 0.30,
  itRisk: 0.30,
  vuln: 0.40,
};

// ─── Score Extraction ──────────────────────────────────────────

function extractSRAScore(): AssessmentStatus {
  const status: AssessmentStatus = {
    name: 'Security Risk Assessment (SRA)',
    key: STORAGE_KEYS.sra,
    lastCompleted: null,
    score: null,
    status: 'not-started',
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.sra);
    if (!saved) return status;

    const data = JSON.parse(saved);

    if (data.responses && Object.keys(data.responses).length > 0) {
      status.status = 'in-progress';
    }

    if (data.report) {
      status.status = 'completed';
      status.lastCompleted = data.report.completedAt || data.lastSaved;

      // SRA score: percentage of 'yes' answers = compliance score
      const responses = data.report.results?.flatMap(
        (r: { responses: Array<{ answer: string }> }) => r.responses
      ) || [];
      const total = responses.length;
      const yesCount = responses.filter(
        (r: { answer: string }) => r.answer === 'yes'
      ).length;
      const naCount = responses.filter(
        (r: { answer: string }) => r.answer === 'na'
      ).length;

      const applicable = total - naCount;
      status.score = applicable > 0 ? Math.round((yesCount / applicable) * 100) : 100;
    }
  } catch {
    // Corrupted data
  }

  return status;
}

function extractITRiskScore(): AssessmentStatus {
  const status: AssessmentStatus = {
    name: 'IT Risk Assessment',
    key: STORAGE_KEYS.itRisk,
    lastCompleted: null,
    score: null,
    status: 'not-started',
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.itRisk);
    if (!saved) return status;

    const data = JSON.parse(saved);

    if (data.responses && Object.keys(data.responses).length > 0) {
      status.status = 'in-progress';
    }

    if (data.report) {
      status.status = 'completed';
      status.lastCompleted = data.report.completedAt || data.lastSaved;

      // IT Risk: lower overall risk score = better security posture
      // Risk scores typically range from 1-25
      // Convert: score of 1 = 100/100, score of 25 = 0/100
      const riskScore = data.report.overallRiskScore || 0;
      status.score = Math.max(0, Math.round(100 - (riskScore / 25) * 100));
    }
  } catch {
    // Corrupted data
  }

  return status;
}

function extractVulnScore(): AssessmentStatus {
  const status: AssessmentStatus = {
    name: 'Vulnerability Assessment',
    key: STORAGE_KEYS.vuln,
    lastCompleted: null,
    score: null,
    status: 'not-started',
    findingsCount: 0,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.vuln);
    if (!saved) return status;

    const data = JSON.parse(saved);

    if (data.scans && data.scans.length > 0) {
      status.status = 'completed';
      status.lastCompleted = data.completedAt || new Date().toISOString();

      // Calculate score based on severity breakdown
      // Deductions: critical=-20, high=-10, medium=-5, low=-2, info=0
      const breakdown = data.severityBreakdown || {};
      const criticalCount = breakdown.critical || 0;
      const highCount = breakdown.high || 0;
      const mediumCount = breakdown.medium || 0;
      const lowCount = breakdown.low || 0;
      const infoCount = breakdown.info || 0;

      const totalFindings = criticalCount + highCount + mediumCount + lowCount + infoCount;
      status.findingsCount = totalFindings;

      const deductions =
        (criticalCount * 20) +
        (highCount * 10) +
        (mediumCount * 5) +
        (lowCount * 2);

      status.score = Math.max(0, 100 - deductions);
    }
  } catch {
    // Corrupted data
  }

  return status;
}

// ─── Risk Extraction ───────────────────────────────────────────

function extractSRARisks(): UnifiedRisk[] {
  const risks: UnifiedRisk[] = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.sra);
    if (!saved) return risks;

    const data = JSON.parse(saved);
    if (!data.report?.results) return risks;

    for (const result of data.report.results) {
      for (const response of result.responses) {
        if (response.answer === 'no' || response.answer === 'partial') {
          risks.push({
            id: `SRA-${response.questionId}`,
            source: 'SRA',
            severity: response.answer === 'no' ? 'high' : 'medium',
            title: `SRA Gap: ${response.questionId}`,
            description: response.notes || `Non-compliant response for ${response.questionId}`,
            remediation: 'Address the identified SRA compliance gap.',
          });
        }
      }
    }
  } catch {
    // Skip
  }

  return risks;
}

function extractITRiskRisks(): UnifiedRisk[] {
  const risks: UnifiedRisk[] = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.itRisk);
    if (!saved) return risks;

    const data = JSON.parse(saved);
    if (!data.report?.results) return risks;

    for (const result of data.report.results) {
      for (const response of result.responses) {
        if (response.answer === 'no' || response.answer === 'partial') {
          const riskScore = response.likelihood && response.impact ?
            calculateSimpleRiskScore(response.likelihood, response.impact) : 5;

          let severity: UnifiedRisk['severity'] = 'low';
          if (riskScore >= 20) severity = 'critical';
          else if (riskScore >= 12) severity = 'high';
          else if (riskScore >= 6) severity = 'medium';

          risks.push({
            id: `ITR-${response.questionId}`,
            source: 'IT Risk',
            severity,
            title: `IT Risk: ${response.questionId}`,
            description: response.notes || `Risk identified for ${response.questionId}`,
            remediation: 'Address the identified IT risk.',
          });
        }
      }
    }
  } catch {
    // Skip
  }

  return risks;
}

function extractVulnRisks(): UnifiedRisk[] {
  const risks: UnifiedRisk[] = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.vuln);
    if (!saved) return risks;

    const data = JSON.parse(saved);
    if (!data.scans) return risks;

    for (const scan of data.scans) {
      for (const finding of scan.findings) {
        if (finding.severity !== 'info') {
          risks.push({
            id: finding.id,
            source: 'Vulnerability Scan',
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            remediation: finding.remediation,
          });
        }
      }
    }
  } catch {
    // Skip
  }

  return risks;
}

function calculateSimpleRiskScore(likelihood: string, impact: string): number {
  const likelihoodMap: Record<string, number> = {
    'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5,
  };
  const impactMap: Record<string, number> = {
    'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'critical': 5,
  };
  return (likelihoodMap[likelihood] || 3) * (impactMap[impact] || 3);
}

// ─── Main Functions ────────────────────────────────────────────

const SEVERITY_ORDER: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export function calculateSecurityPosture(): SecurityPosture {
  const sra = extractSRAScore();
  const itRisk = extractITRiskScore();
  const vuln = extractVulnScore();

  const assessments = [sra, itRisk, vuln];

  // Calculate weighted overall score
  // Only include completed assessments in the calculation
  let totalWeight = 0;
  let weightedSum = 0;

  if (sra.score !== null) {
    weightedSum += sra.score * WEIGHTS.sra;
    totalWeight += WEIGHTS.sra;
  }
  if (itRisk.score !== null) {
    weightedSum += itRisk.score * WEIGHTS.itRisk;
    totalWeight += WEIGHTS.itRisk;
  }
  if (vuln.score !== null) {
    weightedSum += vuln.score * WEIGHTS.vuln;
    totalWeight += WEIGHTS.vuln;
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Determine rating
  let overallRating: string;
  if (overallScore >= 90) overallRating = 'Excellent';
  else if (overallScore >= 75) overallRating = 'Good';
  else if (overallScore >= 60) overallRating = 'Fair';
  else if (overallScore >= 40) overallRating = 'Poor';
  else overallRating = 'Critical';

  // Combine and sort risks
  const allRisks = [
    ...extractSRARisks(),
    ...extractITRiskRisks(),
    ...extractVulnRisks(),
  ].sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0));

  const topRisks = allRisks.slice(0, 10);

  // Load history
  const history = loadPostureHistory();

  return {
    overallScore,
    overallRating,
    assessments,
    topRisks,
    history,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── History Management ────────────────────────────────────────

function loadPostureHistory(): PostureHistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.postureHistory);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function savePostureSnapshot(posture: SecurityPosture): void {
  const history = loadPostureHistory();
  const today = new Date().toISOString().split('T')[0];

  // Only save one entry per day (update if exists)
  const existingIndex = history.findIndex((h) => h.date === today);
  const entry: PostureHistoryEntry = {
    date: today,
    score: posture.overallScore,
    sraScore: posture.assessments[0]?.score ?? null,
    itRiskScore: posture.assessments[1]?.score ?? null,
    vulnScore: posture.assessments[2]?.score ?? null,
  };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
  } else {
    history.push(entry);
  }

  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = history.filter((h) => new Date(h.date) >= cutoff);

  localStorage.setItem(STORAGE_KEYS.postureHistory, JSON.stringify(filtered));
}

// ─── Rating Helpers ────────────────────────────────────────────

export function getRatingColor(rating: string): { bg: string; text: string; border: string } {
  switch (rating) {
    case 'Excellent': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    case 'Good': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    case 'Fair': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    case 'Poor': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    case 'Critical': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreRingColor(score: number): string {
  if (score >= 90) return 'stroke-green-500';
  if (score >= 75) return 'stroke-blue-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}
