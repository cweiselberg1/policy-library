# IT Risk Assessment Questionnaire

## Overview

The IT Risk Assessment Questionnaire is a comprehensive security risk assessment tool designed for healthcare organizations to evaluate their IT security posture and identify vulnerabilities in compliance with HIPAA Security Rule requirements and NIST Risk Management Framework guidelines.

## Features

### 1. Comprehensive Coverage (50 Questions)

The assessment covers 10 critical IT security categories:

- **Information Assets** - ePHI inventory, data classification, data flows
- **Technical Controls** - Encryption, access controls, audit logging, MFA
- **Network Security** - Firewalls, segmentation, IDS/IPS, VPN
- **Application Security** - SDLC, vulnerability testing, patch management
- **Endpoint Security** - Antivirus, encryption, MDM, BYOD policies
- **Data Security** - Backup, recovery, retention, secure deletion
- **Incident Response** - Monitoring, breach procedures, response plans
- **Third-Party Risk** - Vendor management, BAAs, security assessments
- **User Security** - Training, access management, password policies
- **Compliance & Governance** - Policies, audits, risk management

### 2. NIST-Based Risk Scoring

Each identified risk is scored using industry-standard methodology:

**Risk Score = Likelihood × Impact**

- **Likelihood**: Very Low (1), Low (2), Medium (3), High (4), Very High (5)
- **Impact**: Very Low (1), Low (2), Medium (3), High (4), Critical (5)
- **Risk Levels**:
  - Low: 1-5
  - Medium: 6-11
  - High: 12-19
  - Critical: 20-25

### 3. Answer Options

For each question, choose from:

- **Yes** - Control is fully implemented and effective
- **No** - Control is not in place (triggers risk assessment)
- **Partial** - Control is partially implemented (50% risk score)
- **N/A** - Not applicable to your organization

### 4. Risk Assessment Interface

When answering "No" or "Partial", you can adjust:

- **Likelihood** - How likely is this risk to occur?
- **Impact** - What would be the impact if it occurred?

Default values are provided based on typical risk scenarios, but you can customize based on your specific environment.

### 5. Visual Risk Heat Map

The results include a 5×5 risk heat map showing:

- Distribution of risks across likelihood/impact matrix
- Color-coded risk levels (Green/Yellow/Orange/Red)
- Count of risks at each intersection
- Quick visual identification of high-risk areas

### 6. Prioritized Remediation Plan

All identified risks are automatically:

- Scored and prioritized (highest risk first)
- Categorized by severity (Critical/High/Medium/Low)
- Accompanied by specific remediation guidance
- Listed with detailed implementation steps

### 7. Category Risk Scores

Track risk levels across all 10 security categories:

- Average risk score per category
- Visual progress bars showing risk levels
- Identify which areas need most attention

### 8. Export Options

**Markdown Report**:
- Executive summary with overall risk score
- Risk distribution breakdown
- Complete risk register with all identified risks
- Category-by-category analysis
- Detailed remediation recommendations

**CSV Risk Register**:
- Spreadsheet format for risk tracking
- Risk ID, Category, Description
- Likelihood, Impact, Risk Level, Risk Score
- Remediation guidance
- Import into project management tools

### 9. Progress Auto-Save

- All answers automatically saved to browser localStorage
- Resume assessment at any time
- No data loss if browser closes
- Progress indicator showing completion percentage

### 10. Mixpanel Analytics

Track assessment usage:
- Assessment started
- Assessment completed
- Risk score achieved
- Report exported (format: MD/CSV)

## Usage Guide

### Starting an Assessment

1. Navigate to `/audit/it-risk` or click "IT Risk Assessment" on homepage
2. Read the category description and guidance
3. Answer each question honestly based on current state
4. Add notes for context or future reference

### Answering Questions

**For "Yes" answers:**
- Control is in place and working effectively
- No further action needed for this item

**For "No" answers:**
- Control is missing or not implemented
- Risk assessment appears automatically
- Adjust Likelihood and Impact if needed
- Review suggested remediation

**For "Partial" answers:**
- Control is partially implemented
- Risk score reduced by 50%
- Use when work is in progress

**For "N/A" answers:**
- Question doesn't apply to your organization
- Excluded from risk calculations

### Navigating Categories

- Use sidebar navigation to jump between categories
- Progress bars show completion per category
- "Previous" and "Next" buttons for sequential review
- All progress saved automatically

### Completing the Assessment

1. Answer all 50 questions (100% progress required)
2. Click "Complete Assessment" button
3. Review overall risk score and distribution
4. Examine heat map for visual risk analysis
5. Review prioritized remediation plan
6. Export reports for documentation

### Interpreting Results

**Overall Risk Score:**
- 1-5: Low Risk - Good security posture
- 6-11: Medium Risk - Some gaps to address
- 12-19: High Risk - Significant vulnerabilities
- 20-25: Critical Risk - Immediate action required

**Risk Distribution:**
- Critical: Immediate remediation required
- High: Address within 30 days
- Medium: Address within 90 days
- Low: Include in annual security planning

## Best Practices

### Preparation

1. Gather relevant documentation before starting:
   - Asset inventories
   - Security policies
   - Audit reports
   - Vendor lists
   - Incident logs

2. Involve appropriate stakeholders:
   - IT Security team
   - System administrators
   - Compliance officer
   - HIPAA Security Officer

3. Set aside dedicated time:
   - Plan for 60-90 minutes
   - Minimize interruptions
   - Have reference materials available

### During Assessment

1. Be honest about current state
2. Don't answer based on planned improvements
3. Use notes field to document context
4. Adjust risk scores based on your specific environment
5. Mark "Partial" for work in progress

### After Assessment

1. **Immediate Actions** (Critical Risks):
   - Review all critical risks
   - Assign owners
   - Set deadlines (7-30 days)
   - Track in project management system

2. **Short-Term Actions** (High Risks):
   - Prioritize by business impact
   - Develop implementation plans
   - Budget for required tools/services
   - Target 30-90 day completion

3. **Long-Term Planning** (Medium/Low Risks):
   - Include in annual security roadmap
   - Budget for next fiscal year
   - Assign to security backlog

4. **Documentation**:
   - Export and save reports
   - Share with leadership
   - Include in risk register
   - Retain for compliance documentation

5. **Regular Reassessment**:
   - Conduct assessment annually
   - After major changes (systems, processes)
   - After security incidents
   - Following audit findings

## Remediation Guidance

Each identified risk includes specific, actionable remediation steps. Examples:

**Missing Encryption at Rest:**
- Implement AES-256 encryption for databases
- Enable full-disk encryption on all workstations
- Use encrypted backup media
- Deploy enterprise key management system

**No Multi-Factor Authentication:**
- Implement MFA using authenticator apps
- Require for VPN, remote access, admin accounts
- Deploy MFA solution (Duo, Microsoft Authenticator)
- Disable SMS-based MFA (security risk)

**Outdated Patch Management:**
- Establish patch management process
- Automate patch deployment where possible
- Critical patches: 7-30 days
- Test patches before production deployment

## Integration with Policies

The IT Risk Assessment complements the HIPAA Policy Library:

### Administrative Safeguards Policies
- Risk assessment results inform policy updates
- Identify gaps in current policies
- Document security measures in policies

### Technical Safeguards Policies
- Validate technical control implementation
- Identify technical control gaps
- Guide technical policy development

### Physical Safeguards Policies
- Use with Physical Safeguards Audit tool
- Comprehensive coverage of all safeguard types
- Integrated compliance approach

## Compliance Benefits

### HIPAA Security Rule Compliance

The assessment directly addresses HIPAA requirements:

- **§164.308(a)(1)(ii)(A)** - Risk Assessment (Required)
- **§164.308(a)(1)(ii)(B)** - Risk Management (Required)
- **§164.308(a)** - Administrative Safeguards
- **§164.310** - Physical Safeguards
- **§164.312** - Technical Safeguards

### Audit Preparation

Use assessment results to:
- Demonstrate risk management process
- Document security measures
- Show due diligence
- Prepare for OCR audits
- Support breach investigations

### Business Associate Requirements

Business Associates can use to:
- Assess their security posture
- Identify gaps before CE audits
- Demonstrate compliance to clients
- Prepare for BAA negotiations

## Technical Details

### Data Storage

- All data stored locally in browser (localStorage)
- No server-side storage
- No data transmission to external servers
- Clear browser cache to remove data
- Privacy-focused design

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript required
- LocalStorage required
- No plugins needed

### Export Formats

**Markdown (.md)**:
- Human-readable format
- Easy to share and version control
- Include in documentation repositories
- Convert to PDF with Pandoc

**CSV (.csv)**:
- Import to Excel, Google Sheets
- Risk tracking in project management tools
- Integration with GRC platforms
- Data analysis and reporting

## Future Enhancements

Planned features:
- Risk treatment tracking (Accept/Mitigate/Transfer/Avoid)
- Residual risk calculation after controls
- Historical trending across multiple assessments
- Comparison with industry benchmarks
- Integration with vulnerability scanners
- Automated control validation
- Team collaboration features
- Custom question/category support

## Support and Resources

### Additional Resources

- [NIST Risk Management Framework](https://csrc.nist.gov/projects/risk-management)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [HHS Risk Assessment Guidance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html)

### Related Tools

- Physical Safeguards Audit (`/audit/physical`)
- HIPAA Policy Library (Covered Entities and Business Associates)

## Version History

### Version 1.0 (February 2026)
- Initial release
- 50 questions across 10 categories
- NIST-based risk scoring
- Heat map visualization
- Prioritized remediation planning
- Export to Markdown and CSV
- Auto-save progress
- Mixpanel analytics integration

---

**Questions or feedback?** Contact One Guy Consulting for HIPAA compliance support.
