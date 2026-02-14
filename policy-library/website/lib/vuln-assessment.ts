/**
 * Vulnerability Assessment Library
 * Parsers for Nmap, Nuclei, ZAP, Nikto, Lynis, Trivy, and OpenVAS scan results
 * Export functions for professional reports and CSV registers
 */

// ─── Data Models ───────────────────────────────────────────────

export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type VulnSource = 'nmap' | 'nuclei' | 'zap' | 'nikto' | 'lynis' | 'trivy' | 'openvas';

export interface VulnFinding {
  id: string;
  source: VulnSource;
  severity: VulnSeverity;
  title: string;
  description: string;
  target: string;
  port?: number;
  protocol?: string;
  cve?: string[];
  cvss?: number;
  remediation: string;
  reference?: string[];
  evidence?: string;
  timestamp: string;
}

export interface ScanResult {
  tool: string;
  target: string;
  scanDate: string;
  findings: VulnFinding[];
  rawFileName: string;
}

export interface VulnAssessmentReport {
  scans: ScanResult[];
  totalFindings: number;
  severityBreakdown: Record<VulnSeverity, number>;
  topRisks: VulnFinding[];
  completedAt: string;
}

// ─── Severity Utilities ────────────────────────────────────────

const SEVERITY_ORDER: Record<VulnSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export function compareSeverity(a: VulnSeverity, b: VulnSeverity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}

export function cvssToSeverity(cvss: number): VulnSeverity {
  if (cvss >= 9.0) return 'critical';
  if (cvss >= 7.0) return 'high';
  if (cvss >= 4.0) return 'medium';
  if (cvss >= 0.1) return 'low';
  return 'info';
}

export function severityColor(severity: VulnSeverity): string {
  switch (severity) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'yellow';
    case 'low': return 'blue';
    case 'info': return 'gray';
  }
}

export function calculateOverallRiskRating(breakdown: Record<VulnSeverity, number>): string {
  if (breakdown.critical > 0) return 'Critical';
  if (breakdown.high > 2) return 'High';
  if (breakdown.high > 0 || breakdown.medium > 5) return 'Medium-High';
  if (breakdown.medium > 0) return 'Medium';
  if (breakdown.low > 0) return 'Low';
  return 'Informational';
}

// ─── ID Generator ──────────────────────────────────────────────

let idCounter = 0;
function generateId(source: VulnSource): string {
  idCounter++;
  return `${source.toUpperCase()}-${String(idCounter).padStart(4, '0')}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ─── Parsers ───────────────────────────────────────────────────

/** Parse Nmap XML output using browser DOMParser */
export function parseNmapXml(xml: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const hosts = doc.querySelectorAll('host');
  hosts.forEach((host) => {
    const addrEl = host.querySelector('address');
    const target = addrEl?.getAttribute('addr') || 'unknown';

    // Parse open ports
    const ports = host.querySelectorAll('port');
    ports.forEach((port) => {
      const portId = parseInt(port.getAttribute('portid') || '0', 10);
      const protocol = port.getAttribute('protocol') || 'tcp';
      const stateEl = port.querySelector('state');
      const state = stateEl?.getAttribute('state') || 'unknown';
      const serviceEl = port.querySelector('service');
      const serviceName = serviceEl?.getAttribute('name') || '';
      const serviceVersion = serviceEl?.getAttribute('version') || '';
      const serviceProduct = serviceEl?.getAttribute('product') || '';

      if (state === 'open') {
        // Report open port as info finding
        findings.push({
          id: generateId('nmap'),
          source: 'nmap',
          severity: 'info',
          title: `Open Port: ${portId}/${protocol} (${serviceName || 'unknown service'})`,
          description: `Port ${portId}/${protocol} is open running ${serviceProduct} ${serviceVersion}`.trim(),
          target,
          port: portId,
          protocol,
          remediation: 'Review if this port needs to be publicly accessible. Close unnecessary ports.',
          timestamp: new Date().toISOString(),
        });
      }

      // Parse NSE script results (vulnerability scripts)
      const scripts = port.querySelectorAll('script');
      scripts.forEach((script) => {
        const scriptId = script.getAttribute('id') || '';
        const output = script.getAttribute('output') || '';

        if (scriptId.includes('vuln') || scriptId.includes('exploit')) {
          // Extract CVEs from output
          const cveMatches = output.match(/CVE-\d{4}-\d+/g) || [];
          const isVulnerable = output.toLowerCase().includes('vulnerable') ||
            output.toLowerCase().includes('state: vulnerable');

          if (isVulnerable) {
            findings.push({
              id: generateId('nmap'),
              source: 'nmap',
              severity: cveMatches.length > 0 ? 'high' : 'medium',
              title: `Vulnerability: ${scriptId} on port ${portId}`,
              description: output.substring(0, 500),
              target,
              port: portId,
              protocol,
              cve: cveMatches.length > 0 ? cveMatches : undefined,
              remediation: 'Apply security patches and updates. Review service configuration.',
              evidence: output,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
    });

    // Parse host-level scripts
    const hostScripts = host.querySelectorAll(':scope > hostscript > script');
    hostScripts.forEach((script) => {
      const scriptId = script.getAttribute('id') || '';
      const output = script.getAttribute('output') || '';

      if (output.toLowerCase().includes('vulnerable')) {
        const cveMatches = output.match(/CVE-\d{4}-\d+/g) || [];
        findings.push({
          id: generateId('nmap'),
          source: 'nmap',
          severity: 'high',
          title: `Host Vulnerability: ${scriptId}`,
          description: output.substring(0, 500),
          target,
          cve: cveMatches.length > 0 ? cveMatches : undefined,
          remediation: 'Investigate and patch the identified vulnerability.',
          evidence: output,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  return findings;
}

/** Parse Nuclei JSONL output (one JSON object per line) */
export function parseNucleiJsonl(text: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const lines = text.split('\n').filter((l) => l.trim());

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      const severityMap: Record<string, VulnSeverity> = {
        critical: 'critical',
        high: 'high',
        medium: 'medium',
        low: 'low',
        info: 'info',
        unknown: 'info',
      };

      const severity = severityMap[entry.info?.severity?.toLowerCase()] || 'info';
      const cves: string[] = [];
      if (entry.info?.classification?.['cve-id']) {
        const cveIds = entry.info.classification['cve-id'];
        if (Array.isArray(cveIds)) cves.push(...cveIds);
        else if (typeof cveIds === 'string') cves.push(cveIds);
      }

      let cvss: number | undefined;
      if (entry.info?.classification?.['cvss-score']) {
        cvss = parseFloat(entry.info.classification['cvss-score']);
      }

      findings.push({
        id: generateId('nuclei'),
        source: 'nuclei',
        severity,
        title: entry.info?.name || entry['template-id'] || 'Unknown Finding',
        description: entry.info?.description || entry.info?.name || '',
        target: entry.host || entry['matched-at'] || 'unknown',
        cve: cves.length > 0 ? cves : undefined,
        cvss,
        remediation: entry.info?.remediation || 'Review and address the identified issue.',
        reference: entry.info?.reference || undefined,
        evidence: entry['matched-at'] || entry.matcher_name || undefined,
        timestamp: entry.timestamp || new Date().toISOString(),
      });
    } catch {
      // Skip malformed lines
    }
  }

  return findings;
}

/** Parse OWASP ZAP JSON output */
export function parseZapJson(json: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const data = JSON.parse(json);

  // ZAP formats: either { site: [...] } or { alerts: [...] } or direct array
  let alerts: Array<Record<string, unknown>> = [];

  if (data.site) {
    const sites = Array.isArray(data.site) ? data.site : [data.site];
    for (const site of sites) {
      if (site.alerts) {
        alerts = alerts.concat(site.alerts);
      }
    }
  } else if (data.alerts) {
    alerts = Array.isArray(data.alerts) ? data.alerts : [data.alerts];
  } else if (Array.isArray(data)) {
    alerts = data;
  }

  const riskToSeverity: Record<string, VulnSeverity> = {
    '3': 'high',
    '2': 'medium',
    '1': 'low',
    '0': 'info',
    High: 'high',
    Medium: 'medium',
    Low: 'low',
    Informational: 'info',
  };

  for (const alert of alerts) {
    const risk = String(alert.riskcode || alert.risk || '0');
    const severity = riskToSeverity[risk] || 'info';
    const cweId = alert.cweid ? String(alert.cweid) : undefined;

    // Extract instances for evidence
    let evidence = '';
    if (alert.instances && Array.isArray(alert.instances)) {
      evidence = (alert.instances as Array<Record<string, string>>)
        .slice(0, 3)
        .map((inst) => `${inst.method || 'GET'} ${inst.uri || ''}`)
        .join('\n');
    }

    findings.push({
      id: generateId('zap'),
      source: 'zap',
      severity,
      title: String(alert.alert || alert.name || 'ZAP Finding'),
      description: String(alert.desc || alert.description || '').replace(/<[^>]*>/g, ''),
      target: String(alert.url || alert.uri || 'unknown'),
      remediation: String(alert.solution || alert.remediation || 'Review the finding and apply appropriate fixes.').replace(/<[^>]*>/g, ''),
      reference: alert.reference
        ? String(alert.reference).replace(/<[^>]*>/g, '').split('\n').filter(Boolean)
        : cweId ? [`https://cwe.mitre.org/data/definitions/${cweId}.html`] : undefined,
      evidence: evidence || undefined,
      timestamp: new Date().toISOString(),
    });
  }

  return findings;
}

/** Parse Nikto JSON output */
export function parseNiktoJson(json: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const data = JSON.parse(json);

  // Nikto outputs { host, ip, port, vulnerabilities: [...] } or as an array
  const entries = Array.isArray(data) ? data : [data];

  for (const entry of entries) {
    const host = entry.host || entry.ip || 'unknown';
    const port = entry.port ? parseInt(String(entry.port), 10) : undefined;
    const vulns = entry.vulnerabilities || [];

    for (const vuln of vulns) {
      const osvdbId = vuln.OSVDB || vuln.id || '';
      const method = vuln.method || 'GET';
      const url = vuln.url || vuln.uri || '';
      const msg = vuln.msg || vuln.message || vuln.description || '';

      // Estimate severity from content
      let severity: VulnSeverity = 'low';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('remote code') || msgLower.includes('injection') || msgLower.includes('backdoor')) {
        severity = 'critical';
      } else if (msgLower.includes('xss') || msgLower.includes('sql') || msgLower.includes('traversal')) {
        severity = 'high';
      } else if (msgLower.includes('disclosure') || msgLower.includes('default') || msgLower.includes('outdated')) {
        severity = 'medium';
      } else if (msgLower.includes('header') || msgLower.includes('cookie') || msgLower.includes('information')) {
        severity = 'low';
      }

      findings.push({
        id: generateId('nikto'),
        source: 'nikto',
        severity,
        title: msg.substring(0, 120) || `Nikto Finding ${osvdbId}`,
        description: msg,
        target: `${host}${url}`,
        port,
        remediation: 'Review and remediate the identified web server issue.',
        reference: osvdbId ? [`https://osvdb.org/show/osvdb/${osvdbId}`] : undefined,
        evidence: `${method} ${url}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return findings;
}

/** Parse Lynis report (key=value format or JSON wrapper) */
export function parseLynisReport(text: string): VulnFinding[] {
  const findings: VulnFinding[] = [];

  // Try JSON first (our converter output)
  try {
    const data = JSON.parse(text);
    if (data.findings && Array.isArray(data.findings)) {
      for (const f of data.findings) {
        const severityMap: Record<string, VulnSeverity> = {
          warning: 'medium',
          suggestion: 'low',
          high: 'high',
          medium: 'medium',
          low: 'low',
        };

        findings.push({
          id: generateId('lynis'),
          source: 'lynis',
          severity: severityMap[f.severity?.toLowerCase()] || severityMap[f.type] || 'low',
          title: f.description || f.id || 'Lynis Finding',
          description: f.details || f.description || '',
          target: data.target || 'localhost',
          remediation: 'Review system hardening recommendation and apply appropriate configuration.',
          timestamp: data.scanDate || new Date().toISOString(),
        });
      }
      return findings;
    }
  } catch {
    // Not JSON, parse as key=value
  }

  // Parse key=value Lynis report format
  const lines = text.split('\n');
  const target = 'localhost';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('warning[]=')) {
      const value = trimmed.substring('warning[]='.length);
      const parts = value.split('|');
      findings.push({
        id: generateId('lynis'),
        source: 'lynis',
        severity: 'medium',
        title: parts[1] || parts[0] || 'Lynis Warning',
        description: parts[3] || parts[1] || value,
        target,
        remediation: parts[3] || 'Review and address the system hardening warning.',
        evidence: `Test ID: ${parts[0] || 'unknown'}`,
        timestamp: new Date().toISOString(),
      });
    } else if (trimmed.startsWith('suggestion[]=')) {
      const value = trimmed.substring('suggestion[]='.length);
      const parts = value.split('|');
      findings.push({
        id: generateId('lynis'),
        source: 'lynis',
        severity: 'low',
        title: parts[1] || parts[0] || 'Lynis Suggestion',
        description: parts[2] || parts[1] || value,
        target,
        remediation: parts[2] || 'Consider implementing the suggested hardening measure.',
        evidence: `Test ID: ${parts[0] || 'unknown'}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return findings;
}

/** Parse Trivy JSON output */
export function parseTrivyJson(json: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const data = JSON.parse(json);

  // Trivy format: { Results: [{ Target, Vulnerabilities: [...] }] }
  const results = data.Results || [];

  for (const result of results) {
    const resultTarget = result.Target || 'unknown';
    const vulns = result.Vulnerabilities || [];

    for (const vuln of vulns) {
      const severity = (vuln.Severity?.toLowerCase() || 'info') as VulnSeverity;
      const validSeverities: VulnSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
      const normalizedSeverity = validSeverities.includes(severity) ? severity : 'info';

      findings.push({
        id: generateId('trivy'),
        source: 'trivy',
        severity: normalizedSeverity,
        title: `${vuln.VulnerabilityID || 'Unknown'}: ${vuln.PkgName || 'unknown package'}`,
        description: vuln.Description || vuln.Title || '',
        target: resultTarget,
        cve: vuln.VulnerabilityID ? [vuln.VulnerabilityID] : undefined,
        cvss: vuln.CVSS?.nvd?.V3Score || vuln.CVSS?.redhat?.V3Score || undefined,
        remediation: vuln.FixedVersion
          ? `Update ${vuln.PkgName} from ${vuln.InstalledVersion || 'current'} to ${vuln.FixedVersion}`
          : 'No fix available yet. Monitor for updates.',
        reference: vuln.References || undefined,
        evidence: vuln.InstalledVersion
          ? `Installed: ${vuln.InstalledVersion}, Fixed: ${vuln.FixedVersion || 'N/A'}`
          : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return findings;
}

/** Parse OpenVAS/Greenbone JSON export */
export function parseOpenVasJson(json: string): VulnFinding[] {
  const findings: VulnFinding[] = [];
  const data = JSON.parse(json);

  // OpenVAS export format varies; handle common structures
  const results = data.results || data.report?.results?.result || data.vulnerabilities || [];
  const entries = Array.isArray(results) ? results : [results];

  for (const entry of entries) {
    const threatMap: Record<string, VulnSeverity> = {
      High: 'high',
      Medium: 'medium',
      Low: 'low',
      Log: 'info',
      Alarm: 'critical',
    };

    const threat = entry.threat || entry.severity_level || '';
    const severity = threatMap[threat] || cvssToSeverity(parseFloat(entry.severity || entry.cvss || '0'));
    const cves: string[] = [];
    const refs: string[] = [];

    // Extract CVEs and references
    const nvtRefs = entry.nvt?.refs?.ref || entry.refs || [];
    const refArray = Array.isArray(nvtRefs) ? nvtRefs : [nvtRefs];
    for (const ref of refArray) {
      const refId = typeof ref === 'string' ? ref : ref?.id || ref?.value || '';
      const refType = typeof ref === 'string' ? '' : ref?.type || '';
      if (refId.startsWith('CVE-')) {
        cves.push(refId);
      } else if (refId.startsWith('http')) {
        refs.push(refId);
      } else if (refType === 'cve') {
        cves.push(refId);
      } else if (refType === 'url') {
        refs.push(refId);
      }
    }

    findings.push({
      id: generateId('openvas'),
      source: 'openvas',
      severity,
      title: entry.name || entry.nvt?.name || 'OpenVAS Finding',
      description: entry.description || entry.nvt?.summary || '',
      target: entry.host || entry.ip || 'unknown',
      port: entry.port ? parseInt(String(entry.port).split('/')[0], 10) : undefined,
      protocol: entry.port ? String(entry.port).split('/')[1] : undefined,
      cve: cves.length > 0 ? cves : undefined,
      cvss: entry.severity ? parseFloat(entry.severity) : undefined,
      remediation: entry.nvt?.solution || entry.solution || 'Review and address the identified vulnerability.',
      reference: refs.length > 0 ? refs : undefined,
      evidence: entry.description?.substring(0, 300) || undefined,
      timestamp: entry.modification_time || entry.timestamp || new Date().toISOString(),
    });
  }

  return findings;
}

// ─── Auto-Detection ────────────────────────────────────────────

export function detectToolFromContent(content: string, fileName: string): VulnSource | null {
  const lowerName = fileName.toLowerCase();

  // Check filename first
  if (lowerName.includes('nmap')) return 'nmap';
  if (lowerName.includes('nuclei')) return 'nuclei';
  if (lowerName.includes('zap')) return 'zap';
  if (lowerName.includes('nikto')) return 'nikto';
  if (lowerName.includes('lynis')) return 'lynis';
  if (lowerName.includes('trivy')) return 'trivy';
  if (lowerName.includes('openvas') || lowerName.includes('greenbone')) return 'openvas';

  // Check content patterns
  const trimmed = content.trim();

  // XML with nmap signature
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<nmaprun')) return 'nmap';

  // JSONL format (Nuclei)
  if (trimmed.includes('\n') && trimmed.startsWith('{')) {
    try {
      const firstLine = JSON.parse(trimmed.split('\n')[0]);
      if (firstLine['template-id'] || firstLine.info?.severity) return 'nuclei';
    } catch { /* not nuclei */ }
  }

  // JSON detection
  try {
    const data = JSON.parse(trimmed);
    if (data.site || (data.alerts && !data.Results)) return 'zap';
    if (data.vulnerabilities && !data.Results) return 'nikto';
    if (data.Results) return 'trivy';
    if (data.report?.results || data.results?.[0]?.nvt) return 'openvas';
    if (data.tool === 'lynis' || data.findings?.[0]?.type === 'warning') return 'lynis';
  } catch { /* not JSON */ }

  // Lynis key=value format
  if (trimmed.includes('warning[]=') || trimmed.includes('suggestion[]=')) return 'lynis';

  return null;
}

export function parseByTool(content: string, tool: VulnSource): VulnFinding[] {
  switch (tool) {
    case 'nmap': return parseNmapXml(content);
    case 'nuclei': return parseNucleiJsonl(content);
    case 'zap': return parseZapJson(content);
    case 'nikto': return parseNiktoJson(content);
    case 'lynis': return parseLynisReport(content);
    case 'trivy': return parseTrivyJson(content);
    case 'openvas': return parseOpenVasJson(content);
  }
}

// ─── Report Building ───────────────────────────────────────────

export function buildReport(scans: ScanResult[]): VulnAssessmentReport {
  const allFindings = scans.flatMap((s) => s.findings);
  const sorted = [...allFindings].sort((a, b) => compareSeverity(a.severity, b.severity));

  const breakdown: Record<VulnSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const f of allFindings) {
    breakdown[f.severity]++;
  }

  return {
    scans,
    totalFindings: allFindings.length,
    severityBreakdown: breakdown,
    topRisks: sorted.slice(0, 10),
    completedAt: new Date().toISOString(),
  };
}

// ─── Export Functions ──────────────────────────────────────────

export function exportVulnReportMarkdown(report: VulnAssessmentReport, clientName?: string): string {
  const date = new Date(report.completedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const targets = [...new Set(report.scans.map((s) => s.target))];
  const tools = [...new Set(report.scans.map((s) => s.tool))];
  const dates = report.scans.map((s) => s.scanDate).sort();

  const allFindings = report.scans.flatMap((s) => s.findings);
  const sorted = [...allFindings].sort((a, b) => compareSeverity(a.severity, b.severity));
  const overallRisk = calculateOverallRiskRating(report.severityBreakdown);

  let md = `# Vulnerability Assessment Report

**Client:** ${clientName || '[Client Name]'}
**Date:** ${date}
**Assessor:** One Guy Consulting

---

## Executive Summary

- **Total findings:** ${report.totalFindings}
- **Critical:** ${report.severityBreakdown.critical} | **High:** ${report.severityBreakdown.high} | **Medium:** ${report.severityBreakdown.medium} | **Low:** ${report.severityBreakdown.low} | **Info:** ${report.severityBreakdown.info}
- **Overall risk rating:** ${overallRisk}

## Scope

- **Targets scanned:** ${targets.join(', ')}
- **Tools used:** ${tools.join(', ')}
- **Date range:** ${dates[0] || 'N/A'} — ${dates[dates.length - 1] || 'N/A'}

---

`;

  // Findings by severity
  const severityGroups: VulnSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  for (const sev of severityGroups) {
    const groupFindings = sorted.filter((f) => f.severity === sev);
    if (groupFindings.length === 0) continue;

    md += `## ${sev.charAt(0).toUpperCase() + sev.slice(1)} Findings (${groupFindings.length})\n\n`;
    md += `| ID | Title | Target | CVE | CVSS | Source | Remediation |\n`;
    md += `|:---|:------|:-------|:----|:-----|:-------|:------------|\n`;

    for (const f of groupFindings) {
      const cveStr = f.cve?.join(', ') || '—';
      const cvssStr = f.cvss ? f.cvss.toFixed(1) : '—';
      const remShort = f.remediation.substring(0, 80).replace(/\|/g, '/');
      const titleShort = f.title.substring(0, 60).replace(/\|/g, '/');
      const targetShort = f.target.substring(0, 30).replace(/\|/g, '/');
      md += `| ${f.id} | ${titleShort} | ${targetShort} | ${cveStr} | ${cvssStr} | ${f.source} | ${remShort} |\n`;
    }
    md += '\n';
  }

  // Remediation priorities
  const actionable = sorted.filter((f) => f.severity !== 'info');
  if (actionable.length > 0) {
    md += `## Remediation Priorities\n\n`;
    md += `The following items should be addressed in priority order:\n\n`;

    let priority = 1;
    for (const f of actionable.slice(0, 20)) {
      const timeline =
        f.severity === 'critical' ? 'Immediate (24-48 hours)' :
        f.severity === 'high' ? 'Urgent (1-2 weeks)' :
        f.severity === 'medium' ? 'Planned (1-3 months)' :
        'Best effort (next review cycle)';

      md += `${priority}. **[${f.severity.toUpperCase()}]** ${f.title}\n`;
      md += `   - Target: ${f.target}\n`;
      md += `   - Timeline: ${timeline}\n`;
      md += `   - Action: ${f.remediation}\n\n`;
      priority++;
    }
  }

  // Methodology
  md += `## Methodology\n\n`;
  md += `This assessment used the following open-source security tools:\n\n`;

  const toolDescriptions: Record<string, string> = {
    nmap: 'Network port scanning and service enumeration with vulnerability detection NSE scripts',
    nuclei: 'Template-based vulnerability scanning covering web applications, APIs, networks, and DNS',
    zap: 'Dynamic web application security testing (DAST) with automated crawling and active scanning',
    nikto: 'Web server vulnerability assessment checking for dangerous files, outdated software, and misconfigurations',
    lynis: 'System hardening audit covering OS configuration, authentication, networking, and file permissions',
    trivy: 'Software composition analysis scanning filesystems and dependencies for known CVEs',
    openvas: 'Comprehensive network vulnerability assessment with authenticated and unauthenticated scanning',
  };

  for (const tool of tools) {
    const key = tool.toLowerCase() as VulnSource;
    md += `- **${tool}:** ${toolDescriptions[key] || 'Security assessment tool'}\n`;
  }

  md += `\nAll testing was performed with explicit authorization from the client.\n`;

  // Appendix
  if (sorted.length > 0) {
    md += `\n## Appendix: Complete Findings Detail\n\n`;
    for (const f of sorted) {
      md += `### ${f.id}: ${f.title}\n\n`;
      md += `- **Severity:** ${f.severity.toUpperCase()}\n`;
      md += `- **Source:** ${f.source}\n`;
      md += `- **Target:** ${f.target}\n`;
      if (f.port) md += `- **Port:** ${f.port}/${f.protocol || 'tcp'}\n`;
      if (f.cve?.length) md += `- **CVE:** ${f.cve.join(', ')}\n`;
      if (f.cvss) md += `- **CVSS:** ${f.cvss}\n`;
      md += `- **Description:** ${f.description}\n`;
      md += `- **Remediation:** ${f.remediation}\n`;
      if (f.evidence) md += `- **Evidence:** \`${f.evidence.substring(0, 200)}\`\n`;
      if (f.reference?.length) md += `- **References:** ${f.reference.join(', ')}\n`;
      md += '\n---\n\n';
    }
  }

  md += `\n*Report generated by One Guy Consulting VAPT Portal*\n`;
  return md;
}

export function exportVulnRegisterCSV(report: VulnAssessmentReport): string {
  const allFindings = report.scans.flatMap((s) => s.findings);
  const sorted = [...allFindings].sort((a, b) => compareSeverity(a.severity, b.severity));

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

  let csv = 'Finding ID,Source Tool,Severity,CVSS,Title,Target,Port,CVE,Remediation,Evidence\n';

  for (const f of sorted) {
    csv += [
      escape(f.id),
      escape(f.source),
      escape(f.severity),
      f.cvss ? f.cvss.toFixed(1) : '',
      escape(f.title),
      escape(f.target),
      f.port ? String(f.port) : '',
      escape(f.cve?.join('; ') || ''),
      escape(f.remediation),
      escape(f.evidence || ''),
    ].join(',') + '\n';
  }

  return csv;
}
