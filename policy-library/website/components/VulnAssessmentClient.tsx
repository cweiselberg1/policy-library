'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  VulnFinding,
  ScanResult,
  VulnAssessmentReport,
  VulnSeverity,
  VulnSource,
  detectToolFromContent,
  parseByTool,
  buildReport,
  exportVulnReportMarkdown,
  exportVulnRegisterCSV,
  compareSeverity,
  resetIdCounter,
} from '@/lib/vuln-assessment';
import {
  DocumentArrowDownIcon,
  ArrowUpTrayIcon,
  ShieldExclamationIcon,
  FunnelIcon,
  TableCellsIcon,
  DocumentTextIcon,
  TrashIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'ogc-vuln-assessment';

type ViewMode = 'import' | 'report';
type SortField = 'severity' | 'source' | 'title' | 'target';
type SortDir = 'asc' | 'desc';

const SEVERITY_COLORS: Record<VulnSeverity, { bg: string; text: string; badge: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-600 text-white' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-500 text-white' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-500 text-white' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-500 text-white' },
  info: { bg: 'bg-slate-50', text: 'text-slate-600', badge: 'bg-slate-400 text-white' },
};

export default function VulnAssessmentClient() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [report, setReport] = useState<VulnAssessmentReport | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('import');
  const [filterSeverity, setFilterSeverity] = useState<VulnSeverity | 'all'>('all');
  const [filterSource, setFilterSource] = useState<VulnSource | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.scans) setScans(data.scans);
        if (data.report) {
          setReport(data.report);
        }
      } catch (e) {
        console.error('Failed to load saved assessment:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const currentReport = scans.length > 0 ? buildReport(scans) : null;
    const data = {
      scans,
      ...currentReport,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (currentReport) setReport(currentReport);
  }, [scans]);

  // All findings combined
  const allFindings = useMemo(() => {
    return scans.flatMap((s) => s.findings);
  }, [scans]);

  // Filtered and sorted findings
  const filteredFindings = useMemo(() => {
    let filtered = [...allFindings];

    if (filterSeverity !== 'all') {
      filtered = filtered.filter((f) => f.severity === filterSeverity);
    }
    if (filterSource !== 'all') {
      filtered = filtered.filter((f) => f.source === filterSource);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'severity':
          cmp = compareSeverity(a.severity, b.severity);
          break;
        case 'source':
          cmp = a.source.localeCompare(b.source);
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'target':
          cmp = a.target.localeCompare(b.target);
          break;
      }
      return sortDir === 'asc' ? -cmp : cmp;
    });

    return filtered;
  }, [allFindings, filterSeverity, filterSource, sortField, sortDir]);

  // Severity breakdown
  const severityBreakdown = useMemo(() => {
    const breakdown: Record<VulnSeverity, number> = {
      critical: 0, high: 0, medium: 0, low: 0, info: 0,
    };
    for (const f of allFindings) {
      breakdown[f.severity]++;
    }
    return breakdown;
  }, [allFindings]);

  // Unique sources in current data
  const activeSources = useMemo(() => {
    return [...new Set(allFindings.map((f) => f.source))];
  }, [allFindings]);

  // ─── Handlers ─────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportError(null);
    setImportSuccess(null);

    for (const file of Array.from(files)) {
      try {
        const content = await file.text();
        const tool = detectToolFromContent(content, file.name);

        if (!tool) {
          setImportError(`Could not detect scan tool for file: ${file.name}. Supported formats: Nmap XML, Nuclei JSONL, ZAP JSON, Nikto JSON, Lynis report, Trivy JSON, OpenVAS JSON.`);
          continue;
        }

        const findings = parseByTool(content, tool);

        if (findings.length === 0) {
          setImportError(`No findings parsed from ${file.name}. The file may be empty or in an unexpected format.`);
          continue;
        }

        const scanResult: ScanResult = {
          tool: tool.charAt(0).toUpperCase() + tool.slice(1),
          target: findings[0]?.target || 'unknown',
          scanDate: new Date().toISOString(),
          findings,
          rawFileName: file.name,
        };

        setScans((prev) => [...prev, scanResult]);
        setImportSuccess(`Imported ${findings.length} findings from ${file.name} (${tool})`);
      } catch (err) {
        setImportError(`Error processing ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Reset file input
    e.target.value = '';
  };

  const removeScan = (index: number) => {
    setScans((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllScans = () => {
    if (confirm('Are you sure you want to clear all scan results? This cannot be undone.')) {
      setScans([]);
      setReport(null);
      resetIdCounter();
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const exportMarkdown = () => {
    if (!report) return;
    const markdown = exportVulnReportMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vuln-assessment-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!report) return;
    const csv = exportVulnRegisterCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vuln-register-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Report View ──────────────────────────

  if (viewMode === 'report' && report) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setViewMode('import')}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Import & Review
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Vulnerability Assessment Report</h1>
                <p className="mt-2 text-slate-600">
                  {report.totalFindings} findings from {report.scans.length} scan{report.scans.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportMarkdown}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export Report
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Severity Breakdown</h2>
            <div className="grid grid-cols-5 gap-4">
              {(['critical', 'high', 'medium', 'low', 'info'] as VulnSeverity[]).map((sev) => (
                <div key={sev} className={`rounded-lg p-4 ${SEVERITY_COLORS[sev].bg}`}>
                  <p className={`text-3xl font-bold ${SEVERITY_COLORS[sev].text}`}>
                    {report.severityBreakdown[sev]}
                  </p>
                  <p className={`text-sm font-medium capitalize ${SEVERITY_COLORS[sev].text}`}>{sev}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Risks */}
          {report.topRisks.length > 0 && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Top Risks</h2>
              <div className="space-y-3">
                {report.topRisks.map((risk, i) => (
                  <div key={risk.id} className={`flex items-start gap-4 rounded-lg border-2 p-4 ${SEVERITY_COLORS[risk.severity].bg}`}>
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${SEVERITY_COLORS[risk.severity].badge} text-sm font-bold`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${SEVERITY_COLORS[risk.severity].badge}`}>
                          {risk.severity}
                        </span>
                        <span className="text-xs text-slate-500">{risk.source} | {risk.target}</span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{risk.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{risk.remediation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scans Summary */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Scans Included</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-left font-semibold text-slate-700">Tool</th>
                    <th className="pb-2 text-left font-semibold text-slate-700">Target</th>
                    <th className="pb-2 text-left font-semibold text-slate-700">File</th>
                    <th className="pb-2 text-right font-semibold text-slate-700">Findings</th>
                  </tr>
                </thead>
                <tbody>
                  {report.scans.map((scan, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-900">{scan.tool}</td>
                      <td className="py-2 text-slate-600">{scan.target}</td>
                      <td className="py-2 text-slate-500">{scan.rawFileName}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{scan.findings.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Import & Review View ─────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Back to Dashboard */}
        <a
          href="/dashboard/privacy-officer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Privacy Officer Dashboard
        </a>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Vulnerability Assessment</h1>
              <p className="mt-2 text-slate-600">
                Import scan results from Nmap, Nuclei, ZAP, Nikto, Lynis, Trivy, or OpenVAS
              </p>
            </div>
            <div className="flex gap-2">
              {allFindings.length > 0 && (
                <>
                  <button
                    onClick={() => setViewMode('report')}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    View Report
                  </button>
                  <button
                    onClick={clearAllScans}
                    className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-lg font-semibold text-slate-700">Import Scan Results</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload JSON, JSONL, XML, or text files from your security tools
          </p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Choose Files
            <input
              type="file"
              accept=".json,.jsonl,.xml,.dat,.txt,.csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <p className="mt-3 text-xs text-slate-400">
            Supported: Nmap (.xml), Nuclei (.jsonl), ZAP (.json), Nikto (.json), Lynis (.dat/.json), Trivy (.json), OpenVAS (.json)
          </p>
        </div>

        {/* Import Messages */}
        {importError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="flex-1 text-sm text-red-700">{importError}</p>
            <button onClick={() => setImportError(null)}>
              <XMarkIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}
        {importSuccess && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="flex-1 text-sm text-green-700">{importSuccess}</p>
            <button onClick={() => setImportSuccess(null)}>
              <XMarkIcon className="h-5 w-5 text-green-400 hover:text-green-600" />
            </button>
          </div>
        )}

        {/* Severity Summary Bar */}
        {allFindings.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                {allFindings.length} Total Findings from {scans.length} Scan{scans.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3">
                {(['critical', 'high', 'medium', 'low', 'info'] as VulnSeverity[]).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase transition-all ${
                      filterSeverity === sev
                        ? SEVERITY_COLORS[sev].badge
                        : `${SEVERITY_COLORS[sev].bg} ${SEVERITY_COLORS[sev].text} hover:opacity-80`
                    }`}
                  >
                    {sev}: {severityBreakdown[sev]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Imported Scans List */}
        {scans.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Imported Scans</h3>
            <div className="flex flex-wrap gap-2">
              {scans.map((scan, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">{scan.tool}</span>
                  <span className="text-xs text-slate-500">({scan.findings.length} findings)</span>
                  <button
                    onClick={() => removeScan(i)}
                    className="ml-1 rounded p-0.5 text-slate-400 hover:bg-red-100 hover:text-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {allFindings.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-slate-500" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as VulnSource | 'all')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                <option value="all">All Tools</option>
                {activeSources.map((src) => (
                  <option key={src} value={src}>
                    {src.charAt(0).toUpperCase() + src.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-slate-500">
              {filteredFindings.length} of {allFindings.length} findings
            </span>
          </div>
        )}

        {/* Findings Table */}
        {filteredFindings.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-10 px-4 py-3"></th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-700 hover:text-blue-600"
                      onClick={() => handleSort('severity')}
                    >
                      Severity {sortField === 'severity' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-700 hover:text-blue-600"
                      onClick={() => handleSort('title')}
                    >
                      Finding {sortField === 'title' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-700 hover:text-blue-600"
                      onClick={() => handleSort('target')}
                    >
                      Target {sortField === 'target' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-700 hover:text-blue-600"
                      onClick={() => handleSort('source')}
                    >
                      Source {sortField === 'source' && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">CVE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.map((finding) => (
                    <>
                      <tr
                        key={finding.id}
                        className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          expandedFinding === finding.id ? 'bg-slate-50' : ''
                        }`}
                        onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                      >
                        <td className="px-4 py-3">
                          <ChevronDownIcon
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                              expandedFinding === finding.id ? 'rotate-180' : ''
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${SEVERITY_COLORS[finding.severity].badge}`}>
                            {finding.severity}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900">
                          {finding.title}
                        </td>
                        <td className="max-w-[150px] truncate px-4 py-3 text-slate-600">
                          {finding.target}
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-600">{finding.source}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {finding.cve?.join(', ') || '—'}
                        </td>
                      </tr>
                      {expandedFinding === finding.id && (
                        <tr key={`${finding.id}-detail`} className="border-b border-slate-200">
                          <td colSpan={6} className="bg-slate-50 px-8 py-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">Description</p>
                                <p className="mt-1 text-sm text-slate-700">{finding.description || 'No description available'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">Remediation</p>
                                <p className="mt-1 text-sm text-slate-700">{finding.remediation}</p>
                              </div>
                              {finding.port && (
                                <div>
                                  <p className="text-xs font-semibold uppercase text-slate-500">Port</p>
                                  <p className="mt-1 text-sm text-slate-700">{finding.port}/{finding.protocol || 'tcp'}</p>
                                </div>
                              )}
                              {finding.cvss && (
                                <div>
                                  <p className="text-xs font-semibold uppercase text-slate-500">CVSS Score</p>
                                  <p className="mt-1 text-sm text-slate-700">{finding.cvss}</p>
                                </div>
                              )}
                              {finding.evidence && (
                                <div className="md:col-span-2">
                                  <p className="text-xs font-semibold uppercase text-slate-500">Evidence</p>
                                  <pre className="mt-1 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-700">
                                    {finding.evidence}
                                  </pre>
                                </div>
                              )}
                              {finding.reference && finding.reference.length > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-xs font-semibold uppercase text-slate-500">References</p>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {finding.reference.map((ref, i) => (
                                      <a
                                        key={i}
                                        href={ref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {ref.length > 60 ? ref.substring(0, 60) + '...' : ref}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allFindings.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <ShieldExclamationIcon className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">No Scan Results Yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              Run security scans using the tools in ~/security-tools/ and import the results above.
            </p>
            <div className="mx-auto mt-6 max-w-md text-left">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Quick Start</p>
              <div className="space-y-1 rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-600">
                <p>cd ~/security-tools</p>
                <p>./run-nmap.sh scanme.nmap.org</p>
                <p>./run-nuclei.sh https://example.com</p>
                <p className="text-slate-400"># Then import results/*.json above</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
