/**
 * Data Device Audit Tool
 * Track and assess security controls for all devices accessing ePHI
 */

export interface DeviceSecurityControls {
  encryption: boolean;
  passwordProtection: boolean;
  autoLock: boolean;
  remoteWipe: boolean;
  antivirusMalware: boolean;
  osUpdated: boolean;
  mdmEnrolled: boolean;
}

export interface Device {
  id: string;
  deviceType: 'laptop' | 'desktop' | 'tablet' | 'smartphone' | 'server' | 'removable-media' | 'other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  assignedTo: string;
  department: string;
  location: string;
  purchaseDate: string;
  operatingSystem: string;
  accessesEPHI: boolean;
  securityControls: DeviceSecurityControls;
  notes?: string;
  lastAuditDate?: string;
}

export interface AuditReport {
  devices: Device[];
  generatedAt: string;
  totalDevices: number;
  ephiDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  riskScore: number;
  findings: AuditFinding[];
}

export interface AuditFinding {
  deviceId: string;
  deviceName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
}

/**
 * Calculate compliance score for a device (0-100)
 */
export function calculateDeviceCompliance(device: Device): number {
  if (!device.accessesEPHI) {
    return 100; // Non-ePHI devices are considered compliant
  }

  const controls = device.securityControls;
  const requiredControls = [
    controls.encryption,
    controls.passwordProtection,
    controls.autoLock,
  ];

  const recommendedControls = [
    controls.remoteWipe,
    controls.antivirusMalware,
    controls.osUpdated,
    controls.mdmEnrolled,
  ];

  // Required controls are weighted more heavily (70% of score)
  const requiredScore = (requiredControls.filter(Boolean).length / requiredControls.length) * 70;

  // Recommended controls make up 30% of score
  const recommendedScore = (recommendedControls.filter(Boolean).length / recommendedControls.length) * 30;

  return Math.round(requiredScore + recommendedScore);
}

/**
 * Calculate overall risk score for the organization (0-100, lower is better)
 */
export function calculateRiskScore(devices: Device[]): number {
  const ephiDevices = devices.filter(d => d.accessesEPHI);

  if (ephiDevices.length === 0) {
    return 0; // No risk if no ePHI devices
  }

  const totalRisk = ephiDevices.reduce((sum, device) => {
    const compliance = calculateDeviceCompliance(device);
    const risk = 100 - compliance; // Invert compliance to get risk
    return sum + risk;
  }, 0);

  return Math.round(totalRisk / ephiDevices.length);
}

/**
 * Identify audit findings for devices
 */
export function identifyFindings(devices: Device[]): AuditFinding[] {
  const findings: AuditFinding[] = [];

  devices.forEach(device => {
    if (!device.accessesEPHI) return;

    const controls = device.securityControls;
    const deviceName = `${device.manufacturer} ${device.model} (SN: ${device.serialNumber})`;

    // Critical findings
    if (!controls.encryption) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'critical',
        issue: 'Missing encryption at rest',
        recommendation: 'Enable full-disk encryption (BitLocker, FileVault, or equivalent) immediately. This is a HIPAA Security Rule requirement for devices accessing ePHI.',
      });
    }

    if (!controls.passwordProtection) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'critical',
        issue: 'No password protection',
        recommendation: 'Require strong password/PIN with minimum 8 characters, complexity requirements, and regular rotation. Configure via MDM or Group Policy.',
      });
    }

    // High findings
    if (!controls.autoLock) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'high',
        issue: 'Auto-lock not configured',
        recommendation: 'Configure automatic screen lock after 5-15 minutes of inactivity to prevent unauthorized access to unattended devices.',
      });
    }

    if (!controls.remoteWipe) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'high',
        issue: 'Remote wipe capability missing',
        recommendation: 'Enable remote wipe capability via MDM. Critical for responding to lost or stolen devices containing ePHI.',
      });
    }

    // Medium findings
    if (!controls.antivirusMalware) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'medium',
        issue: 'Antivirus/anti-malware not installed',
        recommendation: 'Deploy enterprise antivirus solution with centralized management, real-time scanning, and automatic updates.',
      });
    }

    if (!controls.osUpdated) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'medium',
        issue: 'Operating system not current',
        recommendation: 'Enable automatic OS updates or establish patch management process. Unsupported OS versions must not access ePHI.',
      });
    }

    // Low findings
    if (!controls.mdmEnrolled) {
      findings.push({
        deviceId: device.id,
        deviceName,
        severity: 'low',
        issue: 'Not enrolled in MDM/device management',
        recommendation: 'Enroll device in MDM solution (Intune, Jamf, etc.) for centralized security policy enforcement and compliance monitoring.',
      });
    }
  });

  // Sort by severity
  const severityOrder: Record<AuditFinding['severity'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Generate audit report
 */
export function generateAuditReport(devices: Device[]): AuditReport {
  const ephiDevices = devices.filter(d => d.accessesEPHI);
  const compliantDevices = ephiDevices.filter(d => calculateDeviceCompliance(d) >= 80);
  const findings = identifyFindings(devices);

  return {
    devices,
    generatedAt: new Date().toISOString(),
    totalDevices: devices.length,
    ephiDevices: ephiDevices.length,
    compliantDevices: compliantDevices.length,
    nonCompliantDevices: ephiDevices.length - compliantDevices.length,
    riskScore: calculateRiskScore(devices),
    findings,
  };
}

/**
 * Export audit report as Markdown
 */
export function exportAuditReportMarkdown(report: AuditReport): string {
  let md = '# Data Device Audit Report\n\n';
  md += `**Generated:** ${new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n\n`;

  md += '## Executive Summary\n\n';
  md += `- **Total Devices:** ${report.totalDevices}\n`;
  md += `- **Devices Accessing ePHI:** ${report.ephiDevices}\n`;
  md += `- **Compliant Devices:** ${report.compliantDevices} (${report.ephiDevices > 0 ? Math.round((report.compliantDevices / report.ephiDevices) * 100) : 0}%)\n`;
  md += `- **Non-Compliant Devices:** ${report.nonCompliantDevices}\n`;
  md += `- **Overall Risk Score:** ${report.riskScore}/100 ${getRiskLevel(report.riskScore)}\n\n`;

  md += '### Risk Level Interpretation\n\n';
  md += '- 0-20: Low Risk ✅\n';
  md += '- 21-40: Medium Risk ⚠️\n';
  md += '- 41-60: High Risk 🔶\n';
  md += '- 61-100: Critical Risk 🔴\n\n';

  // Findings by severity
  if (report.findings.length > 0) {
    md += '## Findings by Severity\n\n';

    const criticalFindings = report.findings.filter(f => f.severity === 'critical');
    const highFindings = report.findings.filter(f => f.severity === 'high');
    const mediumFindings = report.findings.filter(f => f.severity === 'medium');
    const lowFindings = report.findings.filter(f => f.severity === 'low');

    if (criticalFindings.length > 0) {
      md += `### 🔴 Critical Issues (${criticalFindings.length})\n\n`;
      criticalFindings.forEach((finding, i) => {
        md += `${i + 1}. **${finding.deviceName}**\n`;
        md += `   - **Issue:** ${finding.issue}\n`;
        md += `   - **Recommendation:** ${finding.recommendation}\n\n`;
      });
    }

    if (highFindings.length > 0) {
      md += `### 🔶 High Priority Issues (${highFindings.length})\n\n`;
      highFindings.forEach((finding, i) => {
        md += `${i + 1}. **${finding.deviceName}**\n`;
        md += `   - **Issue:** ${finding.issue}\n`;
        md += `   - **Recommendation:** ${finding.recommendation}\n\n`;
      });
    }

    if (mediumFindings.length > 0) {
      md += `### ⚠️ Medium Priority Issues (${mediumFindings.length})\n\n`;
      mediumFindings.forEach((finding, i) => {
        md += `${i + 1}. **${finding.deviceName}**\n`;
        md += `   - **Issue:** ${finding.issue}\n`;
        md += `   - **Recommendation:** ${finding.recommendation}\n\n`;
      });
    }

    if (lowFindings.length > 0) {
      md += `### ℹ️ Low Priority Issues (${lowFindings.length})\n\n`;
      lowFindings.forEach((finding, i) => {
        md += `${i + 1}. **${finding.deviceName}**\n`;
        md += `   - **Issue:** ${finding.issue}\n`;
        md += `   - **Recommendation:** ${finding.recommendation}\n\n`;
      });
    }
  } else {
    md += '## Findings\n\n';
    md += '✅ No compliance issues identified. All devices accessing ePHI have appropriate security controls in place.\n\n';
  }

  // Device inventory
  md += '## Device Inventory\n\n';

  const ephiDevices = report.devices.filter(d => d.accessesEPHI);
  const nonEphiDevices = report.devices.filter(d => !d.accessesEPHI);

  if (ephiDevices.length > 0) {
    md += '### Devices Accessing ePHI\n\n';
    ephiDevices.forEach(device => {
      const compliance = calculateDeviceCompliance(device);
      const status = compliance >= 80 ? '✅' : compliance >= 60 ? '⚠️' : '🔴';

      md += `#### ${status} ${device.manufacturer} ${device.model}\n\n`;
      md += `- **Serial Number:** ${device.serialNumber}\n`;
      md += `- **Type:** ${device.deviceType}\n`;
      md += `- **Assigned To:** ${device.assignedTo}\n`;
      md += `- **Department:** ${device.department}\n`;
      md += `- **Location:** ${device.location}\n`;
      md += `- **Operating System:** ${device.operatingSystem}\n`;
      md += `- **Compliance Score:** ${compliance}%\n`;
      md += `\n**Security Controls:**\n`;
      md += `- Encryption: ${device.securityControls.encryption ? '✅' : '❌'}\n`;
      md += `- Password Protection: ${device.securityControls.passwordProtection ? '✅' : '❌'}\n`;
      md += `- Auto-Lock: ${device.securityControls.autoLock ? '✅' : '❌'}\n`;
      md += `- Remote Wipe: ${device.securityControls.remoteWipe ? '✅' : '❌'}\n`;
      md += `- Antivirus/Malware: ${device.securityControls.antivirusMalware ? '✅' : '❌'}\n`;
      md += `- OS Updated: ${device.securityControls.osUpdated ? '✅' : '❌'}\n`;
      md += `- MDM Enrolled: ${device.securityControls.mdmEnrolled ? '✅' : '❌'}\n`;
      if (device.notes) {
        md += `\n**Notes:** ${device.notes}\n`;
      }
      md += '\n';
    });
  }

  if (nonEphiDevices.length > 0) {
    md += '### Devices NOT Accessing ePHI\n\n';
    nonEphiDevices.forEach(device => {
      md += `- ${device.manufacturer} ${device.model} (SN: ${device.serialNumber}) - ${device.assignedTo}\n`;
    });
    md += '\n';
  }

  md += '---\n\n';
  md += '*This audit report should be reviewed regularly and updated whenever devices are added, removed, or reconfigured. Maintain as confidential under HIPAA administrative safeguards.*\n';

  return md;
}

/**
 * Export device inventory as CSV
 */
export function exportDeviceInventoryCSV(devices: Device[]): string {
  let csv = 'Device Type,Manufacturer,Model,Serial Number,Assigned To,Department,Location,Purchase Date,Operating System,Accesses ePHI,Encryption,Password,Auto-Lock,Remote Wipe,Antivirus,OS Updated,MDM,Compliance Score,Notes\n';

  devices.forEach(device => {
    const compliance = calculateDeviceCompliance(device);
    const row = [
      device.deviceType,
      device.manufacturer,
      device.model,
      device.serialNumber,
      device.assignedTo,
      device.department,
      device.location,
      device.purchaseDate,
      device.operatingSystem,
      device.accessesEPHI ? 'Yes' : 'No',
      device.securityControls.encryption ? 'Yes' : 'No',
      device.securityControls.passwordProtection ? 'Yes' : 'No',
      device.securityControls.autoLock ? 'Yes' : 'No',
      device.securityControls.remoteWipe ? 'Yes' : 'No',
      device.securityControls.antivirusMalware ? 'Yes' : 'No',
      device.securityControls.osUpdated ? 'Yes' : 'No',
      device.securityControls.mdmEnrolled ? 'Yes' : 'No',
      `${compliance}%`,
      `"${(device.notes || '').replace(/"/g, '""')}"`,
    ].join(',');

    csv += row + '\n';
  });

  return csv;
}

/**
 * Get risk level label from score
 */
function getRiskLevel(score: number): string {
  if (score <= 20) return '(Low Risk ✅)';
  if (score <= 40) return '(Medium Risk ⚠️)';
  if (score <= 60) return '(High Risk 🔶)';
  return '(Critical Risk 🔴)';
}

/**
 * Generate a new device ID
 */
export function generateDeviceId(): string {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
