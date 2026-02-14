/**
 * Engagement Scope Builder Library
 * Data models and document generators for VAPT engagement scoping
 * One Guy Consulting
 */

// ─── Data Models ───────────────────────────────────────────────

export interface ClientInfo {
  organizationName: string;
  contactPerson: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  engagementDate: string;
  startDate: string;
  endDate: string;
}

export type TargetType = 'external-network' | 'internal-network' | 'web-apps' | 'wireless' | 'social-engineering';

export interface ScopeDefinition {
  targetTypes: TargetType[];
  targetList: string;          // IP ranges, domains, URLs (newline-separated)
  excludedSystems: string;     // Systems out of scope (newline-separated)
  testingWindow: 'business-hours' | 'after-hours' | 'weekends' | 'anytime';
}

export type TestingType = 'black-box' | 'gray-box' | 'white-box';

export interface RulesOfEngagement {
  testingType: TestingType;
  exploitationAllowed: 'yes' | 'no' | 'limited';
  socialEngineeringAllowed: boolean;
  physicalTestingAllowed: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  stopConditions: string;
}

export interface EngagementScope {
  clientInfo: ClientInfo;
  scopeDefinition: ScopeDefinition;
  rulesOfEngagement: RulesOfEngagement;
  createdAt: string;
  updatedAt: string;
}

// ─── Default Values ────────────────────────────────────────────

export function createDefaultScope(): EngagementScope {
  const now = new Date().toISOString();
  return {
    clientInfo: {
      organizationName: '',
      contactPerson: '',
      contactTitle: '',
      contactEmail: '',
      contactPhone: '',
      engagementDate: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
    },
    scopeDefinition: {
      targetTypes: [],
      targetList: '',
      excludedSystems: '',
      testingWindow: 'business-hours',
    },
    rulesOfEngagement: {
      testingType: 'gray-box',
      exploitationAllowed: 'limited',
      socialEngineeringAllowed: false,
      physicalTestingAllowed: false,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactEmail: '',
      stopConditions: 'Testing will immediately stop if:\n- Critical system instability is detected\n- Unauthorized data exposure occurs\n- Client requests an immediate halt',
    },
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Display Helpers ───────────────────────────────────────────

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  'external-network': 'External Network',
  'internal-network': 'Internal Network',
  'web-apps': 'Web Applications',
  'wireless': 'Wireless Networks',
  'social-engineering': 'Social Engineering',
};

export const TESTING_TYPE_LABELS: Record<TestingType, string> = {
  'black-box': 'Black Box (no prior knowledge)',
  'gray-box': 'Gray Box (limited knowledge)',
  'white-box': 'White Box (full knowledge)',
};

export const TESTING_WINDOW_LABELS: Record<string, string> = {
  'business-hours': 'Business Hours Only (M-F, 9AM-5PM)',
  'after-hours': 'After Hours Only (evenings/nights)',
  'weekends': 'Weekends Only',
  'anytime': 'Anytime (24/7)',
};

// ─── Document Generators ───────────────────────────────────────

export function generateAuthorizationLetter(scope: EngagementScope): string {
  const { clientInfo, scopeDefinition, rulesOfEngagement } = scope;
  const dateStr = new Date(clientInfo.engagementDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const targetTypes = scopeDefinition.targetTypes
    .map((t) => TARGET_TYPE_LABELS[t])
    .join(', ');

  const targets = scopeDefinition.targetList
    .split('\n')
    .filter(Boolean)
    .map((t) => `  - ${t.trim()}`)
    .join('\n');

  const testingTypeLabel = TESTING_TYPE_LABELS[rulesOfEngagement.testingType];

  return `# Authorization for Security Testing

**Date:** ${dateStr}

---

## Authorization Statement

${clientInfo.organizationName} hereby authorizes **One Guy Consulting** to perform ${testingTypeLabel.toLowerCase()} security testing on the systems and networks described below.

## Authorized Scope

**Testing Types:** ${targetTypes}

**Target Systems:**
${targets || '  - [No targets specified]'}

**Testing Period:** ${clientInfo.startDate ? new Date(clientInfo.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Start Date]'} through ${clientInfo.endDate ? new Date(clientInfo.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[End Date]'}

**Testing Window:** ${TESTING_WINDOW_LABELS[scopeDefinition.testingWindow]}

## Conditions

- Exploitation: ${rulesOfEngagement.exploitationAllowed === 'yes' ? 'Full exploitation authorized' : rulesOfEngagement.exploitationAllowed === 'limited' ? 'Limited exploitation authorized (non-destructive only)' : 'No exploitation authorized (assessment only)'}
- Social Engineering: ${rulesOfEngagement.socialEngineeringAllowed ? 'Authorized' : 'Not authorized'}
- Physical Testing: ${rulesOfEngagement.physicalTestingAllowed ? 'Authorized' : 'Not authorized'}

## Emergency Contact

In the event of an emergency or if testing causes unexpected issues:

- **Name:** ${rulesOfEngagement.emergencyContactName || '[Emergency Contact]'}
- **Phone:** ${rulesOfEngagement.emergencyContactPhone || '[Phone Number]'}
- **Email:** ${rulesOfEngagement.emergencyContactEmail || '[Email Address]'}

## Signatures

**Authorizing Party:**

Signed: _________________________________  Date: _______________

Name: ${clientInfo.contactPerson || '[Contact Name]'}
Title: ${clientInfo.contactTitle || '[Title]'}
Organization: ${clientInfo.organizationName || '[Organization]'}

**Security Assessor:**

Signed: _________________________________  Date: _______________

Name: ___________________________________
Title: Security Consultant
Organization: One Guy Consulting

---

*This document authorizes the security testing described above. The assessor agrees to conduct testing in accordance with the rules of engagement and to handle all findings confidentially.*
`;
}

export function generateScopeDocument(scope: EngagementScope): string {
  const { clientInfo, scopeDefinition, rulesOfEngagement } = scope;

  const targets = scopeDefinition.targetList
    .split('\n')
    .filter(Boolean)
    .map((t) => `- ${t.trim()}`)
    .join('\n');

  const excluded = scopeDefinition.excludedSystems
    .split('\n')
    .filter(Boolean)
    .map((t) => `- ${t.trim()}`)
    .join('\n');

  const targetTypes = scopeDefinition.targetTypes
    .map((t) => `- ${TARGET_TYPE_LABELS[t]}`)
    .join('\n');

  const methodology: string[] = [];
  if (scopeDefinition.targetTypes.includes('external-network') || scopeDefinition.targetTypes.includes('internal-network')) {
    methodology.push('- **Network Scanning:** Port enumeration, service detection, and vulnerability assessment using Nmap and OpenVAS');
  }
  if (scopeDefinition.targetTypes.includes('web-apps')) {
    methodology.push('- **Web Application Testing:** Automated and manual testing using OWASP ZAP, Nuclei, and Nikto');
    methodology.push('- **OWASP Top 10:** Testing for injection, broken authentication, XSS, misconfigurations, and other common web vulnerabilities');
  }
  if (scopeDefinition.targetTypes.includes('wireless')) {
    methodology.push('- **Wireless Assessment:** Network discovery, encryption analysis, and rogue AP detection');
  }
  if (scopeDefinition.targetTypes.includes('social-engineering')) {
    methodology.push('- **Social Engineering:** Phishing simulations, pretexting, and security awareness evaluation');
  }
  methodology.push('- **System Hardening Review:** Configuration audit using Lynis');
  methodology.push('- **Dependency Analysis:** Software composition analysis using Trivy');

  return `# Engagement Scope Document

## 1. Overview

**Client:** ${clientInfo.organizationName || '[Organization Name]'}
**Engagement Date:** ${clientInfo.engagementDate ? new Date(clientInfo.engagementDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]'}
**Assessor:** One Guy Consulting
**Contact:** ${clientInfo.contactPerson || '[Contact Name]'}, ${clientInfo.contactTitle || '[Title]'}
**Email:** ${clientInfo.contactEmail || '[Email]'}
**Phone:** ${clientInfo.contactPhone || '[Phone]'}

This document defines the scope, rules of engagement, and methodology for the security assessment of ${clientInfo.organizationName || 'the client'}'s systems and applications.

## 2. Targets In Scope

### Target Types
${targetTypes || '- [No target types selected]'}

### Systems and Networks
${targets || '- [No targets specified]'}

## 3. Targets Out of Scope

The following systems are explicitly excluded from testing:

${excluded || '- No exclusions specified — all listed targets are in scope'}

## 4. Testing Methodology

The assessment will use the following approach:

**Testing Type:** ${TESTING_TYPE_LABELS[rulesOfEngagement.testingType]}

**Tools and Techniques:**
${methodology.join('\n')}

**Approach:**
1. **Reconnaissance:** Passive and active information gathering on in-scope targets
2. **Enumeration:** Port scanning, service detection, and version identification
3. **Vulnerability Assessment:** Automated scanning with manual validation
4. **Exploitation (if authorized):** ${rulesOfEngagement.exploitationAllowed === 'yes' ? 'Full exploitation to demonstrate impact' : rulesOfEngagement.exploitationAllowed === 'limited' ? 'Limited, non-destructive exploitation to validate findings' : 'No exploitation — assessment only'}
5. **Reporting:** Detailed findings with severity ratings, evidence, and remediation guidance

## 5. Rules of Engagement

| Rule | Setting |
|:-----|:--------|
| Testing Type | ${TESTING_TYPE_LABELS[rulesOfEngagement.testingType]} |
| Exploitation | ${rulesOfEngagement.exploitationAllowed === 'yes' ? 'Authorized' : rulesOfEngagement.exploitationAllowed === 'limited' ? 'Limited (non-destructive)' : 'Not authorized'} |
| Social Engineering | ${rulesOfEngagement.socialEngineeringAllowed ? 'Authorized' : 'Not authorized'} |
| Physical Testing | ${rulesOfEngagement.physicalTestingAllowed ? 'Authorized' : 'Not authorized'} |
| Testing Window | ${TESTING_WINDOW_LABELS[scopeDefinition.testingWindow]} |

**Additional Rules:**
- All testing will be conducted from authorized IP addresses
- No denial-of-service testing unless explicitly authorized
- All data collected during testing will be handled confidentially
- Findings will be reported only to authorized personnel

## 6. Timeline

| Phase | Dates | Duration |
|:------|:------|:---------|
| Kickoff & Planning | ${clientInfo.startDate ? new Date(clientInfo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} | 1 day |
| Active Testing | ${clientInfo.startDate ? new Date(clientInfo.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} — ${clientInfo.endDate ? new Date(clientInfo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} | As scheduled |
| Report Delivery | Within 5 business days of testing completion | — |
| Remediation Support | 30 days post-report | — |

## 7. Communication Plan

**Primary Contact:**
- Name: ${clientInfo.contactPerson || '[Contact Name]'}
- Email: ${clientInfo.contactEmail || '[Email]'}
- Phone: ${clientInfo.contactPhone || '[Phone]'}

**Reporting:**
- Daily status updates via email during active testing
- Immediate notification for critical/high severity findings
- Final report delivered within 5 business days

**Escalation Path:**
1. Primary contact for routine communications
2. Emergency contact for urgent issues or incidents

## 8. Emergency Procedures

**Emergency Contact:**
- Name: ${rulesOfEngagement.emergencyContactName || '[Emergency Contact]'}
- Phone: ${rulesOfEngagement.emergencyContactPhone || '[Phone]'}
- Email: ${rulesOfEngagement.emergencyContactEmail || '[Email]'}

**Stop Conditions:**
${rulesOfEngagement.stopConditions.split('\n').map(l => l.trim()).filter(Boolean).join('\n')}

**Incident Response:**
- If testing causes system instability, testing will be immediately paused
- The assessor will contact the emergency contact within 15 minutes
- Testing will not resume until authorized by the client
- All relevant logs and evidence will be preserved

---

*Document prepared by One Guy Consulting*
*Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*
`;
}
