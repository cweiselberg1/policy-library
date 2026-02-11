/**
 * IT Risk Assessment Questionnaire
 * Comprehensive risk assessment covering all major IT security areas
 * Based on NIST Risk Management Framework and HIPAA Security Rule
 */

export type RiskLikelihood = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type RiskImpact = 'very-low' | 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskQuestion {
  id: string;
  text: string;
  guidance: string;
  category: string;
  // If answer is 'no', these indicate the risk
  defaultLikelihood: RiskLikelihood;
  defaultImpact: RiskImpact;
}

export interface RiskCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: RiskQuestion[];
}

export interface RiskResponse {
  questionId: string;
  answer: 'yes' | 'no' | 'partial' | 'na';
  likelihood?: RiskLikelihood;
  impact?: RiskImpact;
  notes?: string;
}

export interface RiskCategoryResult {
  categoryId: string;
  responses: RiskResponse[];
  completedAt?: string;
}

export interface RiskAssessmentReport {
  results: RiskCategoryResult[];
  startedAt: string;
  completedAt?: string;
  overallRiskScore?: number;
  riskDistribution?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface IdentifiedRisk {
  categoryId: string;
  categoryTitle: string;
  questionId: string;
  question: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  riskLevel: RiskLevel;
  riskScore: number;
  remediation: string;
  priority: number;
}

// Risk calculation constants
const LIKELIHOOD_VALUES: Record<RiskLikelihood, number> = {
  'very-low': 1,
  'low': 2,
  'medium': 3,
  'high': 4,
  'very-high': 5,
};

const IMPACT_VALUES: Record<RiskImpact, number> = {
  'very-low': 1,
  'low': 2,
  'medium': 3,
  'high': 4,
  'critical': 5,
};

export const RISK_CATEGORIES: RiskCategory[] = [
  {
    id: 'information-assets',
    title: 'Information Assets',
    description: 'Identification and classification of ePHI and sensitive data assets',
    icon: 'database',
    questions: [
      {
        id: 'ia-1',
        text: 'Have you created and maintain a complete inventory of all systems that store, process, or transmit ePHI?',
        guidance: 'This includes servers, databases, applications, workstations, mobile devices, and cloud services. The inventory should be documented and regularly updated.',
        category: 'information-assets',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ia-2',
        text: 'Is all ePHI classified by sensitivity level and data handling requirements?',
        guidance: 'Classification should define security controls, access restrictions, retention periods, and disposal requirements for each data type.',
        category: 'information-assets',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
      {
        id: 'ia-3',
        text: 'Do you maintain data flow diagrams showing how ePHI moves through your systems?',
        guidance: 'Document all data flows including collection, storage, processing, transmission, and disposal of ePHI. Include third-party integrations.',
        category: 'information-assets',
        defaultLikelihood: 'medium',
        defaultImpact: 'medium',
      },
      {
        id: 'ia-4',
        text: 'Have you identified all locations where ePHI is stored (including backups, archives, and temporary files)?',
        guidance: 'Consider databases, file servers, backup media, cloud storage, local workstations, mobile devices, email systems, and printed materials.',
        category: 'information-assets',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ia-5',
        text: 'Do you have documented retention and disposal schedules for all ePHI?',
        guidance: 'Define how long each type of ePHI must be retained and secure disposal procedures when retention period expires.',
        category: 'information-assets',
        defaultLikelihood: 'medium',
        defaultImpact: 'medium',
      },
    ],
  },
  {
    id: 'technical-controls',
    title: 'Technical Controls',
    description: 'Encryption, access controls, audit logging, and technical safeguards',
    icon: 'lock',
    questions: [
      {
        id: 'tc-1',
        text: 'Is all ePHI encrypted at rest using industry-standard encryption (AES-256 or equivalent)?',
        guidance: 'Encryption should cover databases, file storage, backups, and any media containing ePHI. Keys must be securely managed.',
        category: 'technical-controls',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'tc-2',
        text: 'Is all ePHI encrypted in transit using TLS 1.2 or higher?',
        guidance: 'All transmission of ePHI over networks (internal or external) should use strong encryption protocols. Disable older protocols (SSL, TLS 1.0/1.1).',
        category: 'technical-controls',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'tc-3',
        text: 'Do you enforce strong password policies (minimum 12 characters, complexity requirements, regular rotation)?',
        guidance: 'Passwords should be complex, unique, regularly changed, and not reused. Consider implementing password managers for users.',
        category: 'technical-controls',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tc-4',
        text: 'Is multi-factor authentication (MFA) required for all access to ePHI systems?',
        guidance: 'MFA should be mandatory for VPN, remote access, administrative accounts, and direct ePHI system access. SMS-based MFA is discouraged; use authenticator apps or hardware tokens.',
        category: 'technical-controls',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'tc-5',
        text: 'Do you maintain comprehensive audit logs of all access to ePHI?',
        guidance: 'Logs should capture user identity, date/time, action performed, and data accessed. Logs must be retained, protected from tampering, and regularly reviewed.',
        category: 'technical-controls',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tc-6',
        text: 'Are audit logs automatically monitored for suspicious activity and security events?',
        guidance: 'Implement automated monitoring and alerting for failed login attempts, privilege escalation, unusual access patterns, and policy violations.',
        category: 'technical-controls',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tc-7',
        text: 'Do you implement role-based access control (RBAC) with least privilege principle?',
        guidance: 'Users should only have access to the minimum ePHI necessary for their job functions. Access rights should be formally assigned and regularly reviewed.',
        category: 'technical-controls',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tc-8',
        text: 'Are automatic session timeouts configured for all ePHI systems (typically 15-30 minutes)?',
        guidance: 'Idle sessions should automatically log out or lock to prevent unauthorized access to unattended workstations.',
        category: 'technical-controls',
        defaultLikelihood: 'medium',
        defaultImpact: 'medium',
      },
    ],
  },
  {
    id: 'network-security',
    title: 'Network Security',
    description: 'Firewalls, network segmentation, VPN, and perimeter security',
    icon: 'shield',
    questions: [
      {
        id: 'ns-1',
        text: 'Are enterprise-grade firewalls deployed at all network perimeters?',
        guidance: 'Firewalls should be configured with deny-all-by-default rules, allowing only necessary traffic. Regular rule reviews are essential.',
        category: 'network-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'ns-2',
        text: 'Is network segmentation implemented to isolate ePHI systems from general business networks?',
        guidance: 'ePHI systems should be on separate network segments with restricted access. Use VLANs, firewalls, or physical separation.',
        category: 'network-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ns-3',
        text: 'Do you use intrusion detection/prevention systems (IDS/IPS)?',
        guidance: 'IDS/IPS monitors network traffic for malicious activity and can block or alert on threats. Should be actively maintained with current signatures.',
        category: 'network-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ns-4',
        text: 'Is remote access to ePHI systems secured through encrypted VPN connections?',
        guidance: 'All remote access must use VPN with strong encryption. Split tunneling should be disabled. MFA should be required for VPN access.',
        category: 'network-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'ns-5',
        text: 'Are wireless networks properly secured with WPA3 or WPA2-Enterprise encryption?',
        guidance: 'Guest wireless networks must be completely segregated from ePHI networks. Use certificate-based authentication where possible.',
        category: 'network-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ns-6',
        text: 'Do you perform regular vulnerability scans of your network infrastructure?',
        guidance: 'Automated vulnerability scanning should occur at least monthly. Critical vulnerabilities must be remediated within defined timeframes.',
        category: 'network-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
    ],
  },
  {
    id: 'application-security',
    title: 'Application Security',
    description: 'Secure development, authentication, patching, and application controls',
    icon: 'code',
    questions: [
      {
        id: 'as-1',
        text: 'Do you follow secure software development lifecycle (SDLC) practices for applications handling ePHI?',
        guidance: 'Include security requirements in design, code reviews, security testing, and deployment processes. Document security controls in applications.',
        category: 'application-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'as-2',
        text: 'Are all applications regularly tested for security vulnerabilities (OWASP Top 10)?',
        guidance: 'Conduct regular penetration testing and security assessments. Address SQL injection, XSS, CSRF, and other common vulnerabilities.',
        category: 'application-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'as-3',
        text: 'Do you maintain an inventory of all software and applications with version tracking?',
        guidance: 'Track all installed software, versions, patch levels, and dependencies. Essential for vulnerability management and incident response.',
        category: 'application-security',
        defaultLikelihood: 'medium',
        defaultImpact: 'medium',
      },
      {
        id: 'as-4',
        text: 'Are security patches applied within defined timeframes (critical patches within 30 days)?',
        guidance: 'Establish patch management process with risk-based prioritization. Test patches before deployment but don\'t delay critical security updates.',
        category: 'application-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'as-5',
        text: 'Do you disable or remove unnecessary features, services, and accounts in applications?',
        guidance: 'Follow principle of least functionality. Remove default accounts, sample data, debugging features, and unused services.',
        category: 'application-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'as-6',
        text: 'Are application programming interfaces (APIs) secured with authentication and rate limiting?',
        guidance: 'All APIs accessing ePHI must require authentication tokens, use encryption, implement rate limiting, and log all access.',
        category: 'application-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
    ],
  },
  {
    id: 'endpoint-security',
    title: 'Endpoint Security',
    description: 'Antivirus, device management, BYOD policies, and endpoint protection',
    icon: 'computer',
    questions: [
      {
        id: 'es-1',
        text: 'Is enterprise antivirus/anti-malware software deployed on all endpoints accessing ePHI?',
        guidance: 'Antivirus should be centrally managed, automatically updated, and configured for real-time scanning. Cannot be disabled by users.',
        category: 'endpoint-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'es-2',
        text: 'Are all workstations and mobile devices configured with full-disk encryption?',
        guidance: 'Encryption protects data if devices are lost or stolen. Should be enforced via MDM or Group Policy and cannot be disabled by users.',
        category: 'endpoint-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'es-3',
        text: 'Do you use Mobile Device Management (MDM) or Endpoint Management tools?',
        guidance: 'MDM allows remote management, security configuration enforcement, remote wipe capability, and compliance monitoring for all devices.',
        category: 'endpoint-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'es-4',
        text: 'Are operating systems kept current with security patches (Windows, macOS, iOS, Android)?',
        guidance: 'Automate OS patching where possible. Unsupported OS versions (e.g., Windows 7) must not access ePHI systems.',
        category: 'endpoint-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'es-5',
        text: 'Is USB port usage controlled or disabled on endpoints accessing ePHI?',
        guidance: 'Block unauthorized USB devices to prevent data exfiltration and malware. If USB required, enforce encryption and whitelist approved devices.',
        category: 'endpoint-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'es-6',
        text: 'Do you have a formal BYOD (Bring Your Own Device) policy with security requirements?',
        guidance: 'If personal devices access ePHI, require MDM enrollment, encryption, MFA, and remote wipe capability. Document acceptable use.',
        category: 'endpoint-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'es-7',
        text: 'Are lost or stolen devices reported immediately with automated remote wipe procedures?',
        guidance: 'Establish 24/7 reporting mechanism. Remote wipe should be triggered within hours of report. Document all incidents.',
        category: 'endpoint-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    description: 'Backup, recovery, data retention, and secure deletion',
    icon: 'archive',
    questions: [
      {
        id: 'ds-1',
        text: 'Do you perform regular automated backups of all ePHI systems?',
        guidance: 'Backups should be automated, scheduled (at least daily for critical systems), and include all ePHI repositories and databases.',
        category: 'data-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'ds-2',
        text: 'Are backups encrypted and stored securely (offsite or in separate cloud region)?',
        guidance: 'Backup media must be encrypted. Store copies offsite or in geographically separate cloud region. Protect from ransomware.',
        category: 'data-security',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'ds-3',
        text: 'Do you regularly test backup restoration procedures (at least annually)?',
        guidance: 'Verify backups are valid and can be restored within required timeframes. Document restoration procedures and test results.',
        category: 'data-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ds-4',
        text: 'Is there a documented disaster recovery plan with defined RTO/RPO objectives?',
        guidance: 'Define Recovery Time Objective (RTO) and Recovery Point Objective (RPO) for each system. Document recovery procedures and test regularly.',
        category: 'data-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ds-5',
        text: 'Do you use secure deletion methods when disposing of ePHI (NIST 800-88 guidelines)?',
        guidance: 'Use certified data wiping tools, degaussing, or physical destruction. Obtain certificates of destruction. Never return failed drives to vendors.',
        category: 'data-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ds-6',
        text: 'Are database integrity controls implemented to detect unauthorized changes?',
        guidance: 'Use checksums, digital signatures, or database audit features to detect tampering with ePHI records.',
        category: 'data-security',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
    ],
  },
  {
    id: 'incident-response',
    title: 'Incident Response',
    description: 'Security monitoring, incident detection, breach procedures, and response plans',
    icon: 'alert',
    questions: [
      {
        id: 'ir-1',
        text: 'Do you have a documented incident response plan specific to ePHI breaches?',
        guidance: 'Plan should define roles, responsibilities, communication procedures, and step-by-step response actions for security incidents involving ePHI.',
        category: 'incident-response',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'ir-2',
        text: 'Is there 24/7 security monitoring with automated alerting for critical events?',
        guidance: 'Implement SIEM (Security Information and Event Management) or equivalent. Alert on failed logins, privilege escalation, data exfiltration attempts.',
        category: 'incident-response',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ir-3',
        text: 'Have you defined and documented breach notification procedures (patients, HHS, media)?',
        guidance: 'Know when breach notification is required (60 days to HHS, 60 days to individuals). Have notification templates ready. Understand media notification thresholds.',
        category: 'incident-response',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'ir-4',
        text: 'Do you maintain an incident response team with defined roles and contact information?',
        guidance: 'Designate incident response team members (IT, security, legal, compliance, PR). Ensure 24/7 contact availability during incidents.',
        category: 'incident-response',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ir-5',
        text: 'Are security incidents logged, tracked, and analyzed for root causes?',
        guidance: 'Maintain incident log with details of all security events. Conduct post-incident reviews to identify lessons learned and prevent recurrence.',
        category: 'incident-response',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'ir-6',
        text: 'Do you conduct regular incident response drills or tabletop exercises?',
        guidance: 'Test incident response plan at least annually through simulated breach scenarios. Update plan based on exercise findings.',
        category: 'incident-response',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
    ],
  },
  {
    id: 'third-party-risk',
    title: 'Third-Party Risk',
    description: 'Vendor management, Business Associate Agreements, and supply chain security',
    icon: 'users',
    questions: [
      {
        id: 'tr-1',
        text: 'Do you maintain an inventory of all vendors/contractors with access to ePHI?',
        guidance: 'Track all Business Associates and their subcontractors. Include cloud service providers, IT support vendors, and any service provider with ePHI access.',
        category: 'third-party-risk',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'tr-2',
        text: 'Are signed Business Associate Agreements (BAAs) in place for all vendors accessing ePHI?',
        guidance: 'BAAs must be signed before any ePHI is disclosed. Agreements should specify security obligations, breach notification requirements, and audit rights.',
        category: 'third-party-risk',
        defaultLikelihood: 'very-high',
        defaultImpact: 'critical',
      },
      {
        id: 'tr-3',
        text: 'Do you conduct security assessments of vendors before granting ePHI access?',
        guidance: 'Assess vendor security practices through questionnaires, audits, or certifications (SOC 2, HITRUST). Document due diligence.',
        category: 'third-party-risk',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tr-4',
        text: 'Are vendor access rights limited to minimum necessary ePHI?',
        guidance: 'Restrict vendor access to only the ePHI required for their specific services. Use separate accounts for vendor access with appropriate logging.',
        category: 'third-party-risk',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tr-5',
        text: 'Do you regularly review and audit vendor compliance with security requirements?',
        guidance: 'Conduct annual reviews of vendor security practices. Obtain updated security documentation and audit reports. Assess ongoing compliance.',
        category: 'third-party-risk',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'tr-6',
        text: 'Are there procedures for immediate termination of vendor access when contracts end?',
        guidance: 'Disable vendor access immediately upon contract termination. Ensure return or destruction of all ePHI. Obtain certificate of destruction.',
        category: 'third-party-risk',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
    ],
  },
  {
    id: 'user-security',
    title: 'User Security',
    description: 'Security awareness training, password policies, and user access management',
    icon: 'user-group',
    questions: [
      {
        id: 'us-1',
        text: 'Do all workforce members receive HIPAA security awareness training upon hire and annually?',
        guidance: 'Training should cover HIPAA basics, password security, phishing awareness, physical security, incident reporting, and acceptable use policies.',
        category: 'user-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'us-2',
        text: 'Do you conduct regular phishing simulation exercises?',
        guidance: 'Send simulated phishing emails to test user awareness. Provide additional training to users who fail. Track improvement over time.',
        category: 'user-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'us-3',
        text: 'Are user access rights reviewed and recertified at least annually?',
        guidance: 'Managers should review and approve all access rights for their team members. Remove unnecessary access. Document reviews.',
        category: 'user-security',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'us-4',
        text: 'Is there a formal user provisioning and de-provisioning process?',
        guidance: 'Standardize account creation with proper approvals. Immediate account disabling upon termination. Checklist for access removal.',
        category: 'user-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'us-5',
        text: 'Do you enforce separation of duties for sensitive operations?',
        guidance: 'No single person should be able to complete critical transactions alone. Require multiple approvals for sensitive actions.',
        category: 'user-security',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
      {
        id: 'us-6',
        text: 'Are privileged accounts (admin rights) strictly controlled and monitored?',
        guidance: 'Limit number of admin accounts. Use separate accounts for admin tasks. Monitor all privileged account activity. Require MFA.',
        category: 'user-security',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Governance',
    description: 'Policies, procedures, audits, risk management, and compliance documentation',
    icon: 'document-check',
    questions: [
      {
        id: 'cm-1',
        text: 'Do you have comprehensive, documented HIPAA security policies covering all required areas?',
        guidance: 'Policies should address all HIPAA Security Rule requirements: administrative, physical, and technical safeguards. Updated annually.',
        category: 'compliance',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'cm-2',
        text: 'Have you conducted a comprehensive risk assessment within the past 12 months?',
        guidance: 'Risk assessments should identify threats/vulnerabilities to ePHI, assess likelihood/impact, and document risk mitigation strategies.',
        category: 'compliance',
        defaultLikelihood: 'high',
        defaultImpact: 'critical',
      },
      {
        id: 'cm-3',
        text: 'Is there a designated HIPAA Security Officer with appropriate authority and resources?',
        guidance: 'Security Officer should have direct management support, adequate budget, and authority to implement security measures organization-wide.',
        category: 'compliance',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'cm-4',
        text: 'Do you maintain sanctions/disciplinary policies for security violations?',
        guidance: 'Document consequences for policy violations ranging from warnings to termination. Apply consistently. Track all violations.',
        category: 'compliance',
        defaultLikelihood: 'medium',
        defaultImpact: 'medium',
      },
      {
        id: 'cm-5',
        text: 'Are security policies regularly reviewed and updated (at least annually)?',
        guidance: 'Review policies after security incidents, technology changes, or regulatory updates. Document review dates and changes.',
        category: 'compliance',
        defaultLikelihood: 'high',
        defaultImpact: 'medium',
      },
      {
        id: 'cm-6',
        text: 'Do you maintain documentation of all security-related decisions and risk acceptances?',
        guidance: 'Document risk assessment results, security implementation decisions, and formal acceptance of residual risks. Retain for 6 years.',
        category: 'compliance',
        defaultLikelihood: 'high',
        defaultImpact: 'high',
      },
      {
        id: 'cm-7',
        text: 'Are internal or external security audits conducted regularly?',
        guidance: 'Conduct security audits at least annually. Can be internal or external. Document findings and remediation actions.',
        category: 'compliance',
        defaultLikelihood: 'medium',
        defaultImpact: 'high',
      },
    ],
  },
];

/**
 * Calculate risk level from likelihood and impact
 */
export function calculateRiskLevel(
  likelihood: RiskLikelihood,
  impact: RiskImpact
): RiskLevel {
  const likelihoodScore = LIKELIHOOD_VALUES[likelihood];
  const impactScore = IMPACT_VALUES[impact];
  const riskScore = likelihoodScore * impactScore;

  if (riskScore >= 20) return 'critical';
  if (riskScore >= 12) return 'high';
  if (riskScore >= 6) return 'medium';
  return 'low';
}

/**
 * Calculate numeric risk score
 */
export function calculateRiskScore(
  likelihood: RiskLikelihood,
  impact: RiskImpact
): number {
  return LIKELIHOOD_VALUES[likelihood] * IMPACT_VALUES[impact];
}

/**
 * Analyze risk assessment results and calculate scores
 */
export function analyzeRiskAssessment(results: RiskCategoryResult[]): {
  identifiedRisks: IdentifiedRisk[];
  riskDistribution: { low: number; medium: number; high: number; critical: number };
  overallRiskScore: number;
  categoryScores: Record<string, number>;
} {
  const identifiedRisks: IdentifiedRisk[] = [];
  const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
  let totalRiskScore = 0;
  let riskCount = 0;
  const categoryScores: Record<string, number> = {};

  results.forEach((result) => {
    const category = RISK_CATEGORIES.find((c) => c.id === result.categoryId);
    if (!category) return;

    let categoryRiskScore = 0;
    let categoryRiskCount = 0;

    result.responses.forEach((response) => {
      // Only calculate risk for "no" or "partial" answers
      if (response.answer === 'no' || response.answer === 'partial') {
        const question = category.questions.find((q) => q.id === response.questionId);
        if (!question) return;

        const likelihood = response.likelihood || question.defaultLikelihood;
        const impact = response.impact || question.defaultImpact;
        const riskLevel = calculateRiskLevel(likelihood, impact);
        const riskScore = calculateRiskScore(likelihood, impact);

        // Partial answers get 50% risk score
        const adjustedScore = response.answer === 'partial' ? riskScore * 0.5 : riskScore;

        const risk: IdentifiedRisk = {
          categoryId: category.id,
          categoryTitle: category.title,
          questionId: question.id,
          question: question.text,
          likelihood,
          impact,
          riskLevel,
          riskScore: adjustedScore,
          remediation: getRemediation(question.id),
          priority: adjustedScore,
        };

        identifiedRisks.push(risk);
        riskDistribution[riskLevel]++;
        totalRiskScore += adjustedScore;
        riskCount++;

        categoryRiskScore += adjustedScore;
        categoryRiskCount++;
      }
    });

    // Calculate category score (lower is better)
    categoryScores[result.categoryId] = categoryRiskCount > 0 ? categoryRiskScore / categoryRiskCount : 0;
  });

  // Sort risks by priority (highest risk score first)
  identifiedRisks.sort((a, b) => b.priority - a.priority);

  const overallRiskScore = riskCount > 0 ? totalRiskScore / riskCount : 0;

  return {
    identifiedRisks,
    riskDistribution,
    overallRiskScore,
    categoryScores,
  };
}

/**
 * Get remediation recommendation for a specific risk
 */
function getRemediation(questionId: string): string {
  const remediations: Record<string, string> = {
    'ia-1': 'Create a comprehensive asset inventory spreadsheet or use asset management software. Include all devices, applications, and systems that touch ePHI. Update quarterly and after any major changes.',
    'ia-2': 'Develop a data classification policy defining sensitivity levels (Public, Internal, Confidential, Restricted). Tag all ePHI as Restricted with appropriate handling procedures.',
    'ia-3': 'Document data flows using diagramming tools (Visio, Lucidchart). Show sources, processing steps, storage locations, and destinations. Include all third-party integrations.',
    'ia-4': 'Conduct a thorough ePHI location audit. Check databases, file servers, workstations, mobile devices, backup media, cloud storage, email archives, and printed materials. Document all findings.',
    'ia-5': 'Define retention periods based on legal/regulatory requirements and business needs. Create disposal schedule and procedures for secure deletion. Document and enforce consistently.',

    'tc-1': 'Implement encryption at rest using AES-256 for all ePHI storage. Enable database encryption, full-disk encryption, and encrypted backup media. Use enterprise key management system.',
    'tc-2': 'Configure all systems to use TLS 1.2 or 1.3 for ePHI transmission. Disable older protocols (SSL, TLS 1.0/1.1). Use certificate monitoring to prevent expiration.',
    'tc-3': 'Enforce password policy via Active Directory or equivalent: minimum 12 characters, complexity requirements, 90-day rotation, no reuse of last 12 passwords. Deploy password manager.',
    'tc-4': 'Implement MFA using authenticator apps (Microsoft Authenticator, Google Authenticator) or hardware tokens. Require for VPN, remote access, admin accounts, and all ePHI system access.',
    'tc-5': 'Enable comprehensive audit logging in all ePHI systems. Log user ID, timestamp, action, and data accessed. Retain logs per policy (typically 6 years). Protect logs from tampering.',
    'tc-6': 'Deploy SIEM (Splunk, LogRhythm, Azure Sentinel) or log management solution. Configure automated alerts for failed logins, privilege escalation, unusual access patterns, and policy violations.',
    'tc-7': 'Implement RBAC by defining roles based on job functions. Assign minimum necessary permissions. Document access matrix. Review quarterly. Use security groups for efficient management.',
    'tc-8': 'Configure automatic session timeout (15-30 minutes of inactivity) via Group Policy or application settings. Lock or logout idle sessions to prevent unauthorized access.',

    'ns-1': 'Deploy enterprise firewalls (Palo Alto, Fortinet, Cisco) at network perimeter. Configure deny-all-by-default rules. Allow only necessary traffic with documented business justification. Review rules quarterly.',
    'ns-2': 'Segment network using VLANs or physical separation. Place ePHI systems on dedicated network segments with firewall rules restricting access. Implement zero-trust network architecture.',
    'ns-3': 'Deploy IDS/IPS (Snort, Suricata, or commercial solution). Position sensors at key network points. Keep signatures current. Configure alerting for critical events. Review alerts daily.',
    'ns-4': 'Require VPN for all remote access using IPSec or SSL VPN with strong encryption. Disable split tunneling. Require MFA for VPN authentication. Log all VPN connections.',
    'ns-5': 'Secure wireless with WPA3 or WPA2-Enterprise with 802.1X authentication. Completely segregate guest wireless from corporate network. Hide SSID broadcasting. Use certificate-based authentication.',
    'ns-6': 'Conduct automated vulnerability scans monthly using Nessus, Qualys, or similar. Prioritize remediation: Critical (7 days), High (30 days), Medium (90 days). Track remediation progress.',

    'as-1': 'Adopt secure SDLC framework (OWASP, Microsoft SDL, NIST). Include security requirements in design phase. Conduct code reviews. Perform security testing before deployment. Document all security controls.',
    'as-2': 'Conduct annual penetration testing by qualified third party. Perform regular vulnerability scanning of applications. Address OWASP Top 10 vulnerabilities. Remediate findings per severity.',
    'as-3': 'Maintain software inventory using asset management tools. Track application name, version, vendor, purpose, and data access. Update with each new deployment or upgrade.',
    'as-4': 'Establish patch management process: Subscribe to security bulletins, assess patches, test in non-production, deploy to production. Critical patches within 30 days, others per risk assessment.',
    'as-5': 'Remove default accounts, sample data, and debugging features from production systems. Disable unused services and ports. Follow CIS Benchmarks for system hardening.',
    'as-6': 'Secure APIs with OAuth 2.0 or API keys. Require authentication for all API calls. Implement rate limiting. Use HTTPS only. Log all API access. Validate and sanitize all inputs.',

    'es-1': 'Deploy enterprise antivirus (CrowdStrike, Microsoft Defender, Sophos) centrally managed via console. Enable real-time scanning, automatic updates, and behavior monitoring. Prevent user disabling.',
    'es-2': 'Enforce full-disk encryption (BitLocker, FileVault) via Group Policy or MDM. Encryption keys managed centrally. Users cannot disable. Monitor compliance dashboard for non-compliant devices.',
    'es-3': 'Implement MDM solution (Intune, Jamf, MobileIron). Enforce security policies, manage applications, monitor compliance, enable remote wipe. Require enrollment for all devices accessing ePHI.',
    'es-4': 'Automate OS patching using WSUS, SCCM, or similar. Configure automatic updates for workstations. Test patches on pilot group before broad deployment. Prohibit unsupported OS versions.',
    'es-5': 'Disable USB ports via Group Policy or MDM where ePHI access occurs. If USB needed, require encryption and whitelist authorized devices only. Block autorun from removable media.',
    'es-6': 'Create BYOD policy requiring: MDM enrollment, full-disk encryption, MFA, remote wipe capability, automatic updates, and separation of personal/business data. Require signed acknowledgment.',
    'es-7': 'Establish 24/7 device loss reporting mechanism (hotline, email). Trigger remote wipe within 4 hours of report. Document all incidents. Replace devices with updated security configuration.',

    'ds-1': 'Implement automated backup solution (Veeam, Commvault, cloud-native). Schedule daily backups for critical systems, weekly for others. Verify backup completion daily. Test backup integrity.',
    'ds-2': 'Encrypt all backup media with AES-256. Store backups offsite or in separate cloud region. Use immutable backups to protect from ransomware. Secure backup credentials separately.',
    'ds-3': 'Test backup restoration quarterly. Document restoration procedures. Measure actual recovery time. Practice full disaster recovery annually. Update procedures based on test results.',
    'ds-4': 'Develop disaster recovery plan defining RTO/RPO for each system. Document step-by-step recovery procedures. Maintain contact lists. Test plan annually. Update after major changes.',
    'ds-5': 'Use NIST 800-88 compliant data destruction: Certified wiping software for functional media, degaussing for magnetic media, physical destruction for failed devices. Obtain destruction certificates.',
    'ds-6': 'Implement database integrity controls: checksums, digital signatures, or audit triggers. Monitor for unauthorized changes. Alert on integrity violations. Log all database modifications.',

    'ir-1': 'Develop incident response plan covering: detection, containment, eradication, recovery, and lessons learned. Define roles and responsibilities. Include breach notification procedures. Test annually.',
    'ir-2': 'Implement SIEM solution for centralized log collection and correlation. Configure real-time alerts for critical security events. Establish 24/7 monitoring or engage SOC service provider.',
    'ir-3': 'Document breach notification procedures: Determine breach threshold (>500 records requires media notification), notification templates, HHS reporting process, state requirements. Engage legal counsel.',
    'ir-4': 'Designate incident response team: Security Lead, IT Manager, Legal, Compliance Officer, PR/Communications. Document contact information. Ensure 24/7 availability. Define escalation procedures.',
    'ir-5': 'Maintain incident log documenting: date/time, description, affected systems/data, response actions, resolution, root cause. Conduct post-incident reviews. Track metrics and trends.',
    'ir-6': 'Conduct tabletop exercises quarterly simulating various breach scenarios (ransomware, insider threat, lost device, vendor breach). Document lessons learned. Update response plan accordingly.',

    'tr-1': 'Create vendor inventory tracking: vendor name, services provided, ePHI access level, BAA status, contact information. Review and update quarterly. Include cloud service providers and IT vendors.',
    'tr-2': 'Use standardized BAA template addressing: permitted uses, safeguards, breach notification, audit rights, termination procedures. Require signing before any ePHI disclosure. Maintain signed copies.',
    'tr-3': 'Conduct vendor security assessments using questionnaires (SIG, CAIQ) or request audit reports (SOC 2 Type II, HITRUST). Evaluate responses. Document due diligence. Risk-rate all vendors.',
    'tr-4': 'Limit vendor access to minimum necessary ePHI. Use dedicated vendor accounts with restricted permissions. Enable MFA. Monitor vendor access via audit logs. Review access quarterly.',
    'tr-5': 'Review vendor security annually: Request updated security documentation, review audit reports, assess compliance with BAA terms. Document review results. Address any findings.',
    'tr-6': 'Establish vendor offboarding checklist: Disable access immediately, require ePHI return or destruction, obtain certificate of destruction, update vendor inventory, document completion.',

    'us-1': 'Conduct HIPAA security training upon hire and annually using formal training program. Topics: HIPAA basics, password security, phishing, physical security, incident reporting. Track completion.',
    'us-2': 'Implement phishing simulation program (KnowBe4, Cofense). Send quarterly simulated phishing emails. Provide immediate training for users who click. Track metrics and improvement over time.',
    'us-3': 'Conduct annual access recertification: Managers review and approve team member access rights. Remove unnecessary access. Document approvals. Track completion. Address non-compliance.',
    'us-4': 'Standardize account lifecycle: New hire request form with approvals, provision minimum necessary access, immediate deactivation upon termination, access removal checklist. Audit regularly.',
    'us-5': 'Implement separation of duties for sensitive operations: Require dual approval for financial transactions, separate duties for system administration, restrict high-privilege combinations. Document matrix.',
    'us-6': 'Restrict privileged accounts: Minimize number of admins, use separate admin accounts, require MFA, prohibit shared accounts, log all privileged activity, review logs monthly, require justification.',

    'cm-1': 'Develop comprehensive HIPAA security policy manual covering all Security Rule requirements: administrative safeguards, physical safeguards, technical safeguards. Review and update annually.',
    'cm-2': 'Conduct annual risk assessment: Identify all ePHI assets, identify threats and vulnerabilities, assess likelihood and impact, document current controls, determine residual risk, prioritize remediation.',
    'cm-3': 'Designate HIPAA Security Officer with: Direct executive reporting, adequate budget, authority to implement controls, appropriate training/certification, dedicated time allocation. Document in writing.',
    'cm-4': 'Establish sanctions policy defining progressive discipline for security violations: verbal warning, written warning, suspension, termination. Apply consistently. Document all violations and actions.',
    'cm-5': 'Review security policies annually or after: security incidents, regulatory changes, technology changes, audit findings. Document review dates, changes made, and approval. Communicate updates.',
    'cm-6': 'Document all security decisions: risk assessment results, control selections, risk acceptances, implementation plans, budget allocations. Maintain documentation for 6 years per HIPAA requirements.',
    'cm-7': 'Conduct annual security audits: Internal review or external assessment of controls, testing of safeguards, review of compliance. Document findings, remediation plans, and completion. Track metrics.',
  };

  return remediations[questionId] || 'Develop and implement appropriate controls to address this risk. Consult HIPAA Security Rule guidance and consider engaging security professionals for specific recommendations.';
}

/**
 * Export risk assessment report as Markdown
 */
export function exportRiskAssessmentMarkdown(report: RiskAssessmentReport): string {
  const analysis = analyzeRiskAssessment(report.results);

  let markdown = '# IT Risk Assessment Report\n\n';
  markdown += `**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  markdown += `**Assessment Period:** ${new Date(report.startedAt).toLocaleDateString()} - ${report.completedAt ? new Date(report.completedAt).toLocaleDateString() : 'In Progress'}\n\n`;

  markdown += '## Executive Summary\n\n';
  markdown += `**Overall Risk Score:** ${analysis.overallRiskScore.toFixed(2)} (out of 25)\n\n`;
  markdown += `**Risk Interpretation:**\n`;
  markdown += `- 1-5: Low Risk\n`;
  markdown += `- 6-11: Medium Risk\n`;
  markdown += `- 12-19: High Risk\n`;
  markdown += `- 20-25: Critical Risk\n\n`;

  markdown += '### Risk Distribution\n\n';
  markdown += `- 🔴 Critical: ${analysis.riskDistribution.critical}\n`;
  markdown += `- 🟠 High: ${analysis.riskDistribution.high}\n`;
  markdown += `- 🟡 Medium: ${analysis.riskDistribution.medium}\n`;
  markdown += `- 🟢 Low: ${analysis.riskDistribution.low}\n\n`;

  markdown += '## Risk Register\n\n';
  markdown += 'Identified risks listed in priority order (highest risk first):\n\n';

  if (analysis.identifiedRisks.length > 0) {
    analysis.identifiedRisks.forEach((risk, index) => {
      const riskIcon = risk.riskLevel === 'critical' ? '🔴' : risk.riskLevel === 'high' ? '🟠' : risk.riskLevel === 'medium' ? '🟡' : '🟢';

      markdown += `### ${index + 1}. ${risk.categoryTitle}\n\n`;
      markdown += `${riskIcon} **Risk Level:** ${risk.riskLevel.toUpperCase()} (Score: ${risk.riskScore.toFixed(1)})\n\n`;
      markdown += `**Risk:** ${risk.question}\n\n`;
      markdown += `**Likelihood:** ${risk.likelihood} | **Impact:** ${risk.impact}\n\n`;
      markdown += `**Remediation:**\n${risk.remediation}\n\n`;
      markdown += '---\n\n';
    });
  } else {
    markdown += '✅ No significant risks identified. All controls are in place.\n\n';
  }

  markdown += '## Category Risk Scores\n\n';
  RISK_CATEGORIES.forEach((category) => {
    const score = analysis.categoryScores[category.id] || 0;
    markdown += `### ${category.title}\n`;
    markdown += `**Average Risk Score:** ${score.toFixed(2)}\n\n`;
  });

  markdown += '---\n\n';
  markdown += '*This risk assessment should be reviewed and updated at least annually or after significant changes to systems, processes, or threats.*\n';

  return markdown;
}

/**
 * Export risk register as CSV
 */
export function exportRiskRegisterCSV(report: RiskAssessmentReport): string {
  const analysis = analyzeRiskAssessment(report.results);

  let csv = 'Risk ID,Category,Risk Description,Likelihood,Impact,Risk Level,Risk Score,Remediation\n';

  analysis.identifiedRisks.forEach((risk, index) => {
    const csvLine = [
      `RISK-${(index + 1).toString().padStart(3, '0')}`,
      risk.categoryTitle,
      `"${risk.question.replace(/"/g, '""')}"`,
      risk.likelihood,
      risk.impact,
      risk.riskLevel,
      risk.riskScore.toFixed(1),
      `"${risk.remediation.replace(/"/g, '""')}"`,
    ].join(',');

    csv += csvLine + '\n';
  });

  return csv;
}
