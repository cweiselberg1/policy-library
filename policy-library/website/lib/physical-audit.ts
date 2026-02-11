/**
 * HIPAA Physical Safeguards Audit Data
 * Based on 45 CFR §164.310
 */

export interface AuditQuestion {
  id: string;
  text: string;
  guidance: string;
  cfr: string;
  required: boolean;
}

export interface AuditSection {
  id: string;
  title: string;
  cfr: string;
  description: string;
  questions: AuditQuestion[];
}

export interface AuditResponse {
  questionId: string;
  answer: 'yes' | 'no' | 'na';
  notes?: string;
}

export interface AuditResult {
  sectionId: string;
  responses: AuditResponse[];
  completedAt?: string;
}

export interface AuditReport {
  results: AuditResult[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  findings?: {
    compliant: number;
    gaps: number;
    notApplicable: number;
  };
}

export const AUDIT_SECTIONS: AuditSection[] = [
  {
    id: 'facility-access',
    title: 'Facility Access Controls',
    cfr: '§164.310(a)(1)',
    description: 'Implement policies and procedures to limit physical access to electronic information systems and the facility or facilities in which they are housed, while ensuring that properly authorized access is allowed.',
    questions: [
      {
        id: 'fac-1',
        text: 'Are there documented policies for controlling physical access to facilities containing ePHI?',
        guidance: 'Your organization should have written policies that specify who can access facilities, under what conditions, and how access is granted/revoked.',
        cfr: '§164.310(a)(1)',
        required: true,
      },
      {
        id: 'fac-2',
        text: 'Do you maintain a facility access control plan that addresses emergency access?',
        guidance: 'You must have procedures for obtaining necessary ePHI during an emergency (fire, power failure, etc.).',
        cfr: '§164.310(a)(2)(i)',
        required: true,
      },
      {
        id: 'fac-3',
        text: 'Are there procedures to authorize and validate physical access to facilities?',
        guidance: 'This includes badge systems, visitor logs, security personnel, or other methods to verify authorized personnel.',
        cfr: '§164.310(a)(2)(ii)',
        required: false,
      },
      {
        id: 'fac-4',
        text: 'Do you maintain logs or other documentation of facility access?',
        guidance: 'Access logs help track who entered secure areas and when. Can include badge swipe logs, sign-in sheets, or security camera footage.',
        cfr: '§164.310(a)(2)(iii)',
        required: false,
      },
      {
        id: 'fac-5',
        text: 'Are there procedures to control visitor access to ePHI areas?',
        guidance: 'Visitors should be escorted, wear badges, or have limited access to areas containing ePHI systems.',
        cfr: '§164.310(a)(2)(iii)',
        required: false,
      },
      {
        id: 'fac-6',
        text: 'Have you identified all locations where ePHI is stored, processed, or transmitted?',
        guidance: 'This includes server rooms, data centers, offices with workstations, and backup storage locations.',
        cfr: '§164.310(a)(1)',
        required: true,
      },
      {
        id: 'fac-7',
        text: 'Are sensitive areas (server rooms, data centers) locked with restricted access?',
        guidance: 'Physical locks, card readers, biometric scanners, or other access controls should be in place.',
        cfr: '§164.310(a)(2)(ii)',
        required: false,
      },
      {
        id: 'fac-8',
        text: 'Do you have procedures for immediately revoking facility access for terminated employees?',
        guidance: 'Access badges, keys, and credentials should be collected and disabled when someone leaves the organization.',
        cfr: '§164.310(a)(2)(iv)',
        required: false,
      },
    ],
  },
  {
    id: 'workstation-use',
    title: 'Workstation Use',
    cfr: '§164.310(b)',
    description: 'Implement policies and procedures that specify the proper functions to be performed, the manner in which those functions are to be performed, and the physical attributes of the surroundings of a specific workstation or class of workstation that can access ePHI.',
    questions: [
      {
        id: 'ws-1',
        text: 'Are there documented policies specifying proper workstation use for accessing ePHI?',
        guidance: 'Policies should define acceptable use, prohibited activities, and security requirements for workstations.',
        cfr: '§164.310(b)',
        required: true,
      },
      {
        id: 'ws-2',
        text: 'Do workstation use policies address physical positioning to minimize unauthorized viewing?',
        guidance: 'Screens should not be visible to unauthorized persons (e.g., facing away from windows, hallways, public areas).',
        cfr: '§164.310(b)',
        required: true,
      },
      {
        id: 'ws-3',
        text: 'Have you trained workforce members on proper workstation use policies?',
        guidance: 'All employees who access ePHI should receive training on workstation security requirements.',
        cfr: '§164.310(b)',
        required: true,
      },
      {
        id: 'ws-4',
        text: 'Do policies require automatic screen locks after a period of inactivity?',
        guidance: 'Workstations should lock automatically (typically 5-15 minutes) when left unattended.',
        cfr: '§164.310(b)',
        required: true,
      },
      {
        id: 'ws-5',
        text: 'Are privacy screens or other visual barriers used where appropriate?',
        guidance: 'In public or shared areas, privacy screens can prevent shoulder surfing and unauthorized viewing.',
        cfr: '§164.310(b)',
        required: false,
      },
      {
        id: 'ws-6',
        text: 'Do policies prohibit leaving workstations logged in and unattended?',
        guidance: 'Users should be required to lock or log out when stepping away from their workstation.',
        cfr: '§164.310(b)',
        required: true,
      },
      {
        id: 'ws-7',
        text: 'Are workstations positioned to prevent unauthorized physical access?',
        guidance: 'Workstations should not be accessible to visitors, patients, or unauthorized personnel.',
        cfr: '§164.310(b)',
        required: true,
      },
    ],
  },
  {
    id: 'workstation-security',
    title: 'Workstation Security',
    cfr: '§164.310(c)',
    description: 'Implement physical safeguards for all workstations that access ePHI, to restrict access to authorized users.',
    questions: [
      {
        id: 'wss-1',
        text: 'Are there physical safeguards to protect workstations from unauthorized access?',
        guidance: 'This includes locks, cable locks, secure mounting, or placement in secure areas.',
        cfr: '§164.310(c)',
        required: true,
      },
      {
        id: 'wss-2',
        text: 'Are laptop computers secured with cable locks or stored in locked areas when not in use?',
        guidance: 'Mobile workstations are particularly vulnerable to theft and should be physically secured.',
        cfr: '§164.310(c)',
        required: true,
      },
      {
        id: 'wss-3',
        text: 'Do you have procedures for securing workstations after business hours?',
        guidance: 'Consider locking offices, enabling alarms, or requiring workstations to be powered off.',
        cfr: '§164.310(c)',
        required: true,
      },
      {
        id: 'wss-4',
        text: 'Are mobile devices (tablets, smartphones) that access ePHI physically protected?',
        guidance: 'Require strong passwords, encryption, remote wipe capability, and physical security when not in use.',
        cfr: '§164.310(c)',
        required: true,
      },
      {
        id: 'wss-5',
        text: 'Have you implemented measures to prevent theft of workstations?',
        guidance: 'This may include security cameras, alarm systems, secured work areas, or asset tracking.',
        cfr: '§164.310(c)',
        required: false,
      },
      {
        id: 'wss-6',
        text: 'Are workstations in shared or public areas (e.g., reception) configured to limit ePHI access?',
        guidance: 'Public-facing workstations should have minimal ePHI access and additional physical controls.',
        cfr: '§164.310(c)',
        required: true,
      },
      {
        id: 'wss-7',
        text: 'Do you maintain an inventory of all workstations that access ePHI?',
        guidance: 'Track make, model, serial numbers, and assigned users for all devices accessing ePHI.',
        cfr: '§164.310(c)',
        required: false,
      },
    ],
  },
  {
    id: 'device-media',
    title: 'Device and Media Controls',
    cfr: '§164.310(d)(1)',
    description: 'Implement policies and procedures that govern the receipt and removal of hardware and electronic media that contain ePHI into and out of a facility, and the movement of these items within the facility.',
    questions: [
      {
        id: 'dm-1',
        text: 'Are there documented policies for disposing of ePHI-containing hardware and media?',
        guidance: 'Must ensure ePHI is rendered unrecoverable before disposal (e.g., shredding, degaussing, secure wiping).',
        cfr: '§164.310(d)(2)(i)',
        required: true,
      },
      {
        id: 'dm-2',
        text: 'Do you have procedures for removing ePHI from electronic media before reuse?',
        guidance: 'When reusing devices, ensure data is securely erased or encrypted so it cannot be recovered.',
        cfr: '§164.310(d)(2)(ii)',
        required: true,
      },
      {
        id: 'dm-3',
        text: 'Have you implemented a process for authorizing removal of ePHI media from the facility?',
        guidance: 'Require management approval and tracking for any device or media leaving the secure facility.',
        cfr: '§164.310(d)(1)',
        required: false,
      },
      {
        id: 'dm-4',
        text: 'Do you maintain logs of hardware/media movements into/out of the facility?',
        guidance: 'Document when devices arrive, are deployed, moved, or removed from secure areas.',
        cfr: '§164.310(d)(2)(iii)',
        required: false,
      },
      {
        id: 'dm-5',
        text: 'Are backup media (tapes, drives, disks) stored securely and inventoried?',
        guidance: 'Backup media should be in locked storage with access logs and periodic inventory checks.',
        cfr: '§164.310(d)(1)',
        required: true,
      },
      {
        id: 'dm-6',
        text: 'Do you use certified data destruction services for disposing of ePHI media?',
        guidance: 'Third-party destruction services should provide certificates of destruction for audit purposes.',
        cfr: '§164.310(d)(2)(i)',
        required: false,
      },
      {
        id: 'dm-7',
        text: 'Are USB drives, external hard drives, and portable media controlled and tracked?',
        guidance: 'Portable media should be encrypted, inventoried, and restricted to authorized personnel only.',
        cfr: '§164.310(d)(1)',
        required: false,
      },
      {
        id: 'dm-8',
        text: 'Do you have procedures for handling failed hardware that contains ePHI?',
        guidance: 'Failed drives/devices should be securely destroyed or retained in secure storage until destruction.',
        cfr: '§164.310(d)(2)(i)',
        required: true,
      },
      {
        id: 'dm-9',
        text: 'Are there policies prohibiting use of personal USB drives or media with ePHI systems?',
        guidance: 'Restrict use of unauthorized removable media to prevent data exfiltration and malware.',
        cfr: '§164.310(d)(1)',
        required: false,
      },
      {
        id: 'dm-10',
        text: 'Do you create and maintain an inventory of all electronic media containing ePHI?',
        guidance: 'Track all devices, backup tapes, USB drives, and other media throughout their lifecycle.',
        cfr: '§164.310(d)(2)(iii)',
        required: false,
      },
    ],
  },
];

/**
 * Calculate audit score and findings
 */
export function calculateAuditScore(results: AuditResult[]): {
  score: number;
  findings: {
    compliant: number;
    gaps: number;
    notApplicable: number;
    total: number;
  };
  sectionScores: Record<string, number>;
} {
  let compliant = 0;
  let gaps = 0;
  let notApplicable = 0;
  let total = 0;
  const sectionScores: Record<string, number> = {};

  results.forEach((result) => {
    const section = AUDIT_SECTIONS.find((s) => s.id === result.sectionId);
    if (!section) return;

    let sectionCompliant = 0;
    let sectionAnswered = 0;

    result.responses.forEach((response) => {
      total++;
      if (response.answer === 'yes') {
        compliant++;
        sectionCompliant++;
        sectionAnswered++;
      } else if (response.answer === 'no') {
        gaps++;
        sectionAnswered++;
      } else if (response.answer === 'na') {
        notApplicable++;
      }
    });

    // Calculate section score (exclude N/A from denominator)
    const sectionTotal = result.responses.filter((r) => r.answer !== 'na').length;
    sectionScores[result.sectionId] = sectionTotal > 0 ? (sectionCompliant / sectionTotal) * 100 : 0;
  });

  // Calculate overall score (exclude N/A from calculation)
  const answeredQuestions = compliant + gaps;
  const score = answeredQuestions > 0 ? (compliant / answeredQuestions) * 100 : 0;

  return {
    score: Math.round(score),
    findings: {
      compliant,
      gaps,
      notApplicable,
      total,
    },
    sectionScores,
  };
}

/**
 * Generate recommendations based on gaps
 */
export function generateRecommendations(results: AuditResult[]): {
  sectionId: string;
  sectionTitle: string;
  questionId: string;
  question: string;
  recommendation: string;
  cfr: string;
  priority: 'high' | 'medium' | 'low';
}[] {
  const recommendations: {
    sectionId: string;
    sectionTitle: string;
    questionId: string;
    question: string;
    recommendation: string;
    cfr: string;
    priority: 'high' | 'medium' | 'low';
  }[] = [];

  results.forEach((result) => {
    const section = AUDIT_SECTIONS.find((s) => s.id === result.sectionId);
    if (!section) return;

    result.responses.forEach((response) => {
      if (response.answer === 'no') {
        const question = section.questions.find((q) => q.id === response.questionId);
        if (!question) return;

        recommendations.push({
          sectionId: section.id,
          sectionTitle: section.title,
          questionId: question.id,
          question: question.text,
          recommendation: getRecommendation(question.id, question.text),
          cfr: question.cfr,
          priority: question.required ? 'high' : 'medium',
        });
      }
    });
  });

  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Get specific recommendation for a gap
 */
function getRecommendation(questionId: string, questionText: string): string {
  const recommendations: Record<string, string> = {
    'fac-1': 'Develop and document a comprehensive facility access control policy. Include procedures for granting, reviewing, and revoking access. Ensure all workforce members are trained on these policies.',
    'fac-2': 'Create an emergency access procedure that defines how to access ePHI during emergencies (fire, power outage, natural disaster). Include contact procedures and backup access methods.',
    'fac-3': 'Implement a badge system, visitor log, or security personnel to validate physical access. Consider card readers, biometric scanners, or PIN-based entry systems.',
    'fac-4': 'Establish access logging procedures. This could be automated (badge swipe logs) or manual (sign-in sheets). Retain logs per your retention policy.',
    'fac-5': 'Create a visitor management policy requiring escorts, visitor badges, and restricted access to ePHI areas. Consider a visitor sign-in system.',
    'fac-6': 'Conduct a physical inventory of all locations where ePHI is stored, processed, or transmitted. Document each location and update regularly.',
    'fac-7': 'Install physical locks, card readers, or biometric access controls on server rooms and data centers. Limit access to authorized IT personnel only.',
    'fac-8': 'Add a checklist to your termination procedure requiring immediate collection of badges, keys, and credentials. Notify security/IT to disable access.',
    'ws-1': 'Develop a workstation use policy covering acceptable use, security requirements, prohibited activities, and user responsibilities. Distribute to all workforce members.',
    'ws-2': 'Assess current workstation positioning. Reposition screens to face away from windows, hallways, and public areas. Consider office layouts and privacy barriers.',
    'ws-3': 'Include workstation use policies in security awareness training. Ensure all users understand proper screen positioning, locking requirements, and security protocols.',
    'ws-4': 'Configure automatic screen lock on all workstations (typically 5-15 minutes). Deploy via Group Policy or MDM solution to ensure consistent enforcement.',
    'ws-5': 'Evaluate high-risk areas (reception, shared workspaces) and deploy privacy screen filters where ePHI is frequently viewed.',
    'ws-6': 'Update policies to explicitly prohibit leaving workstations unlocked and unattended. Require users to lock screens (Windows+L) or log out when leaving.',
    'ws-7': 'Move workstations away from public areas. If not possible, limit ePHI access on public-facing workstations and implement additional access controls.',
    'wss-1': 'Install cable locks on workstations in unsecured areas. Consider locking offices or rooms containing workstations after hours.',
    'wss-2': 'Purchase and deploy cable locks for all laptops. Require laptops to be stored in locked drawers or cabinets when not in use.',
    'wss-3': 'Establish after-hours security procedures: lock offices, enable security systems, require workstations to be locked or powered off. Include in security policy.',
    'wss-4': 'Implement mobile device management (MDM) requiring device encryption, strong passwords, and remote wipe capability. Enforce physical security policies for mobile devices.',
    'wss-5': 'Consider security cameras in areas with ePHI workstations. Implement alarm systems and asset tracking for high-value equipment.',
    'wss-6': 'Audit public-facing workstations and minimize ePHI access. Implement additional physical controls (locks, privacy screens) and restrict user permissions.',
    'wss-7': 'Create an asset inventory spreadsheet or use asset management software. Track all workstations, laptops, and mobile devices accessing ePHI.',
    'dm-1': 'Develop a media disposal policy requiring secure destruction. Use shredding (paper/disks), degaussing (magnetic media), or certified data wiping (drives).',
    'dm-2': 'Establish procedures for secure data erasure before reuse. Use NIST-certified wiping tools or encryption with key destruction. Document all media sanitization.',
    'dm-3': 'Require management approval for removing ePHI media from the facility. Use a checkout log or formal request process for tracking.',
    'dm-4': 'Create a media movement log tracking device arrival, deployment, internal moves, and removal. Include date, description, person responsible, and approval.',
    'dm-5': 'Store backup media in locked, fireproof safes or offsite secure storage. Maintain an inventory and verify integrity periodically.',
    'dm-6': 'Contract with a certified data destruction vendor. Obtain certificates of destruction for all disposed media and retain for audit purposes.',
    'dm-7': 'Implement a portable media control policy. Issue encrypted USB drives only when necessary. Track serial numbers and require check-in/checkout.',
    'dm-8': 'Create a failed hardware procedure: secure storage until destruction, use certified destruction services, obtain destruction certificates. Never return failed drives to vendors.',
    'dm-9': 'Prohibit personal USB drives and unauthorized media in your acceptable use policy. Consider technical controls (USB port blocking) to enforce.',
    'dm-10': 'Maintain a comprehensive media inventory including backup tapes, external drives, USB devices, and any removable media. Update regularly.',
  };

  return recommendations[questionId] || 'Review relevant HIPAA regulations and develop appropriate policies and procedures to address this gap. Consider consulting with a HIPAA compliance expert.';
}

/**
 * Export audit report as Markdown
 */
export function exportAuditReportMarkdown(report: AuditReport): string {
  const { score, findings, sectionScores } = calculateAuditScore(report.results);
  const recommendations = generateRecommendations(report.results);

  let markdown = '# HIPAA Physical Safeguards Audit Report\n\n';
  markdown += `**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  markdown += `**Audit Period:** ${new Date(report.startedAt).toLocaleDateString()} - ${report.completedAt ? new Date(report.completedAt).toLocaleDateString() : 'In Progress'}\n\n`;

  markdown += '## Executive Summary\n\n';
  markdown += `**Overall Compliance Score:** ${score}%\n\n`;
  markdown += `- ✅ Compliant: ${findings.compliant}\n`;
  markdown += `- ⚠️ Gaps Identified: ${findings.gaps}\n`;
  markdown += `- ➖ Not Applicable: ${findings.notApplicable}\n`;
  markdown += `- 📊 Total Questions: ${findings.total}\n\n`;

  markdown += '## Section Scores\n\n';
  AUDIT_SECTIONS.forEach((section) => {
    const sectionScore = sectionScores[section.id] || 0;
    markdown += `### ${section.title} (${section.cfr})\n`;
    markdown += `**Score:** ${Math.round(sectionScore)}%\n\n`;
  });

  if (recommendations.length > 0) {
    markdown += '## Recommendations\n\n';
    markdown += 'The following gaps were identified and require remediation:\n\n';

    const highPriority = recommendations.filter((r) => r.priority === 'high');
    const mediumPriority = recommendations.filter((r) => r.priority === 'medium');

    if (highPriority.length > 0) {
      markdown += '### 🔴 High Priority (Required)\n\n';
      highPriority.forEach((rec, index) => {
        markdown += `${index + 1}. **${rec.sectionTitle}** (${rec.cfr})\n`;
        markdown += `   - **Gap:** ${rec.question}\n`;
        markdown += `   - **Recommendation:** ${rec.recommendation}\n\n`;
      });
    }

    if (mediumPriority.length > 0) {
      markdown += '### 🟡 Medium Priority (Addressable)\n\n';
      mediumPriority.forEach((rec, index) => {
        markdown += `${index + 1}. **${rec.sectionTitle}** (${rec.cfr})\n`;
        markdown += `   - **Gap:** ${rec.question}\n`;
        markdown += `   - **Recommendation:** ${rec.recommendation}\n\n`;
      });
    }
  } else {
    markdown += '## Recommendations\n\n';
    markdown += '✅ No gaps identified. Your physical safeguards meet HIPAA requirements.\n\n';
  }

  markdown += '## Detailed Responses\n\n';
  report.results.forEach((result) => {
    const section = AUDIT_SECTIONS.find((s) => s.id === result.sectionId);
    if (!section) return;

    markdown += `### ${section.title}\n\n`;
    markdown += `**CFR:** ${section.cfr}\n\n`;

    result.responses.forEach((response) => {
      const question = section.questions.find((q) => q.id === response.questionId);
      if (!question) return;

      const answerSymbol = response.answer === 'yes' ? '✅' : response.answer === 'no' ? '❌' : '➖';
      markdown += `${answerSymbol} **${question.text}**\n`;
      if (response.notes) {
        markdown += `   *Notes:* ${response.notes}\n`;
      }
      markdown += '\n';
    });
  });

  markdown += '---\n\n';
  markdown += '*This report is for internal use only and should be maintained as confidential under HIPAA administrative safeguards.*\n';

  return markdown;
}
