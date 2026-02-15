/**
 * Security Risk Assessment (SRA) Questionnaire
 * Based on the One Guy Consulting HIPAA Security Risk Assessment Google Form
 * Questions match the form EXACTLY in order and wording.
 */

export type SRAQuestionType = 'yes-no' | 'multiple-choice' | 'free-text';

export type SRAAnswer = 'yes' | 'no' | string;

export interface SRAQuestion {
  id: string;
  text: string;
  type: SRAQuestionType;
  options?: string[]; // For multiple-choice questions
  remediation?: string; // For yes-no questions (triggered on "No")
}

export interface SRACategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: SRAQuestion[];
}

export interface SRAResponse {
  questionId: string;
  answer: SRAAnswer;
  notes?: string;
}

export interface SRACategoryResult {
  categoryId: string;
  responses: SRAResponse[];
  completedAt?: string;
}

export interface SRAGapItem {
  categoryId: string;
  categoryTitle: string;
  questionId: string;
  questionText: string;
  answer: 'no';
  remediation: string;
  notes?: string;
}

export interface SRAReport {
  results: SRACategoryResult[];
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
  totalQuestions?: number;
  compliantCount?: number;
  gapCount?: number;
}

export const SRA_CATEGORIES: SRACategory[] = [
  {
    id: 'sra-history',
    title: 'SRA History & Leadership',
    description: 'Risk assessment history and organizational leadership for HIPAA compliance',
    icon: 'clipboard-document-check',
    questions: [
      {
        id: 'sra-1',
        type: 'yes-no',
        text: 'Has your company conducted a Security Risk Assessment (SRA) in the last year?',
        remediation: 'Schedule and complete a comprehensive Security Risk Assessment immediately. HIPAA requires periodic risk assessments, and annual SRAs are considered best practice.',
      },
      {
        id: 'sra-2',
        type: 'multiple-choice',
        text: 'How often does your company perform a Security Risk Assessment (SRA)?',
        options: ['Annually', 'Every Six Months', 'This is my first Security Risk Assessment', 'Never'],
      },
      {
        id: 'sra-3',
        type: 'yes-no',
        text: 'Have you appointed a qualified individual to serve as Compliance Officer? This person is responsible for overseeing and ensuring your organization\'s HIPAA compliance plan is implemented and enforced.',
        remediation: 'Appoint a HIPAA Compliance Officer with defined responsibilities, authority, and adequate resources. Document the appointment in writing.',
      },
      {
        id: 'sra-4',
        type: 'yes-no',
        text: 'Have you assigned someone capable of fulfilling the role of Privacy Officer to the position, who will assume responsibility for your Organization\'s compliance program(s)?',
        remediation: 'Designate a Privacy Officer responsible for privacy policies, Notice of Privacy Practices, and privacy complaint handling. This can be the same person as the Compliance Officer in smaller organizations.',
      },
    ],
  },
  {
    id: 'ephi-inventory',
    title: 'ePHI Inventory & Data Flow',
    description: 'Identification and tracking of all electronic Protected Health Information assets',
    icon: 'server-stack',
    questions: [
      {
        id: 'inv-1',
        type: 'free-text',
        text: 'Can you list all physical and digital locations where your company holds, modifies or transmits ePHI?\n\nThis includes things like paper office files, computers, cloud services, backup drives, mobile devices, and any outside companies you work with.',
      },
      {
        id: 'inv-2',
        type: 'yes-no',
        text: 'Does your organization keep an up-to-date listing of all hardware devices that may TOUCH electronic protected health information (ePHI) at any time?',
        remediation: 'Create and maintain a comprehensive asset inventory of all devices that interact with ePHI. Include device type, location, owner, and ePHI access level. Update quarterly.',
      },
    ],
  },
  {
    id: 'safeguards-overview',
    title: 'Safeguards Overview',
    description: 'High-level assessment of administrative, technical, and physical safeguards',
    icon: 'shield-check',
    questions: [
      {
        id: 'sfg-1',
        type: 'free-text',
        text: 'Please explain your organizational security measures for protecting user information across the following three requirements -\nTechnical Safeguards: Detail implemented controls like encryption, access management, network security, and system monitoring.\nPhysical Safeguards: Explain facility security, device controls, and environmental protections.\nAdministrative Safeguards: Outline policies, training programs, risk assessments, and incident response protocols.',
      },
    ],
  },
  {
    id: 'disaster-recovery',
    title: 'Disaster Recovery & Business Continuity',
    description: 'Business continuity planning, backup procedures, and disaster recovery readiness',
    icon: 'arrow-path',
    questions: [
      {
        id: 'dr-1',
        type: 'free-text',
        text: 'Can you describe your organization\'s plan for responding to events such as natural disasters?\n\nSpecifically, do you have a documented backup and recovery plan?\n\nThis plan should include processes that ensure user/patient information can be accessed after a disastrous event promptly and with minimal delay.',
      },
      {
        id: 'dr-2',
        type: 'free-text',
        text: 'Who is the individual responsible for your organization\'s IT systems? If no one comes to mind, please document \'No one\' below.',
      },
    ],
  },
  {
    id: 'security-events',
    title: 'Security Event Response',
    description: 'Processes for handling security events and risk management',
    icon: 'exclamation-triangle',
    questions: [
      {
        id: 'sec-1',
        type: 'free-text',
        text: 'Please explain what steps your organization takes during a security events.\n\nExamples include:\nChecking for risk factors\nHandling risk scenarios\nControlling physical access to the building\nEmployee Training\nRegularly reviewing security practices',
      },
    ],
  },
  {
    id: 'business-associates',
    title: 'Business Associates',
    description: 'Vendor management, Business Associate Agreements, and third-party risk',
    icon: 'building-office',
    questions: [
      {
        id: 'ba-1',
        type: 'yes-no',
        text: 'Do any Business Associates, or other entities have any access to your organization\'s technology systems or digital environment?\nIf yes, please elaborate on the type of access the third party has in the \'other\' field.',
        remediation: 'Identify all third parties with access to your technology systems. Document the type and scope of access each entity has. Ensure appropriate controls are in place.',
      },
      {
        id: 'ba-2',
        type: 'yes-no',
        text: 'Do any Business Associates have the access to modify PHI or user information?',
        remediation: 'Review and document all Business Associate access permissions. Implement least-privilege access controls. Ensure BAs can only access the minimum PHI necessary for their function.',
      },
      {
        id: 'ba-3',
        type: 'yes-no',
        text: 'Are all Business Associate Agreements in place and current for third-parties that have access to Protected Health Information (PHI) (even if in a limited capacity)?',
        remediation: 'Execute Business Associate Agreements with all entities that access PHI immediately. Use a standardized template that meets HIPAA requirements. Track expiration dates.',
      },
      {
        id: 'ba-4',
        type: 'yes-no',
        text: 'Do all existing Business Associate Agreements discuss requiring third parties to safeguard Protected Health Information (PHI) the best they can?',
        remediation: 'Review and update all BAAs to include explicit safeguarding requirements for PHI. Consult legal counsel to ensure adequate protection language.',
      },
      {
        id: 'ba-5',
        type: 'yes-no',
        text: 'Do your Business Associate Agreements include indemnification statements outlining actions to be taken if a breach of Protected Health Information (PHI) is caused by the business associate?',
        remediation: 'Update BAAs to include indemnification provisions that allocate financial responsibility for breaches caused by the Business Associate. Consult legal counsel.',
      },
      {
        id: 'ba-6',
        type: 'free-text',
        text: 'How do you currently mitigate risk to PHI that is associated with a Business Associate relationship?',
      },
    ],
  },
  {
    id: 'employee-training',
    title: 'Employee Training',
    description: 'HIPAA awareness training, cybersecurity education, and workforce compliance',
    icon: 'academic-cap',
    questions: [
      {
        id: 'trn-1',
        type: 'yes-no',
        text: 'Have all employees in your organization received HIPAA 101 training?',
        remediation: 'Implement mandatory HIPAA 101 training for all employees. Track completion and follow up with non-compliant employees. Training must be completed before granting access to PHI.',
      },
      {
        id: 'trn-2',
        type: 'yes-no',
        text: 'Have all employees in your organization received training on CyberSecurity Awareness?',
        remediation: 'Add cybersecurity awareness modules to your training program covering phishing, social engineering, password security, and safe browsing practices.',
      },
      {
        id: 'trn-3',
        type: 'yes-no',
        text: 'Do your employees currently have access to up-to-date policy and procedure documents?',
        remediation: 'Make policies accessible via intranet, shared drive, or physical binder in common areas. Ensure all employees know where to find policies. Update and redistribute after changes.',
      },
      {
        id: 'trn-4',
        type: 'yes-no',
        text: 'Are employees aware that adherence to HIPAA compliance policies is mandatory and that violations may result in termination?',
        remediation: 'Communicate sanctions policy during training and in employee handbook. Apply sanctions consistently. Document all violations and disciplinary actions taken.',
      },
    ],
  },
  {
    id: 'access-controls',
    title: 'Access Controls & Workforce',
    description: 'User authentication, authorization, password policies, and access management',
    icon: 'key',
    questions: [
      {
        id: 'ac-1',
        type: 'free-text',
        text: 'How does your organization determine which employees require access to patient Protected Health Information (PHI) on a regular basis?',
      },
      {
        id: 'ac-2',
        type: 'yes-no',
        text: 'Do all employees who use systems containing Protected Health Information (PHI) have their own unique user IDs?',
        remediation: 'Assign unique user IDs to every person who accesses PHI. Prohibit shared accounts. Ensure IDs are linked to specific individuals for audit trail purposes.',
      },
      {
        id: 'ac-3',
        type: 'yes-no',
        text: 'Does each employee\'s unique user ID require its own individual, user-created password to access systems containing Protected Health Information (PHI), in order to prevent unauthorized access?',
        remediation: 'Enforce individual password requirements for all user accounts. Implement strong password policies with minimum length and complexity requirements.',
      },
      {
        id: 'ac-4',
        type: 'yes-no',
        text: 'Do you train staff to not share passwords?',
        remediation: 'Establish and enforce a no-credential-sharing policy. Include in training and acceptable use policy. Implement technical controls to detect shared account usage.',
      },
      {
        id: 'ac-5',
        type: 'yes-no',
        text: 'Are employees following a \'clean desk\' mandate?\n\nThis would require them to secure sensitive materials and lock their computers when away from their workstations to keep PHI safe.',
        remediation: 'Implement and enforce a clean desk policy requiring PHI to be secured when unattended and computers locked when away from workstations. Conduct periodic compliance checks.',
      },
      {
        id: 'ac-6',
        type: 'yes-no',
        text: 'Do you ensure new hires are trained on the following during their initial onboarding?\n* HIPAA policies and procedures\n* HIPAA 101 training\n* CyberSecurity Awareness training',
        remediation: 'Implement mandatory onboarding training covering HIPAA policies, HIPAA 101, and CyberSecurity Awareness. Training must be completed before granting access to PHI systems.',
      },
      {
        id: 'ac-7',
        type: 'yes-no',
        text: 'Does your staff know who serves as organizational Compliance Officer?',
        remediation: 'Communicate the identity and role of the Compliance Officer to all staff. Post contact information in visible locations and include in training materials.',
      },
      {
        id: 'ac-8',
        type: 'yes-no',
        text: 'Do employees know they are required to report any suspected security incidents to the Compliance Officer?',
        remediation: 'Train employees on incident reporting procedures. Provide clear reporting channels. Ensure non-retaliation for good-faith reports. Include in onboarding and annual refresher training.',
      },
      {
        id: 'ac-9',
        type: 'yes-no',
        text: 'Do you have a policies and procedures in place to deal with the risk of human error?',
        remediation: 'Develop policies addressing human error risks including data entry mistakes, misdirected communications, and accidental disclosures. Include error-prevention training.',
      },
      {
        id: 'ac-10',
        type: 'yes-no',
        text: 'Is there a record kept that contains timestamps for when employee training sessions occur?',
        remediation: 'Document all training activities with dates, topics covered, trainer information, and attendee sign-in sheets. Retain records for at least 6 years per HIPAA requirements.',
      },
    ],
  },
  {
    id: 'monitoring-audit',
    title: 'Monitoring & Audit',
    description: 'Security monitoring, audit logging, intrusion detection, and incident tracking',
    icon: 'eye',
    questions: [
      {
        id: 'mon-1',
        type: 'multiple-choice',
        text: 'How often does your company review employee access and permissions within systems containing PHI?',
        options: ['Annually', 'Bi-Annually', 'Quarterly', 'Never'],
      },
      {
        id: 'mon-2',
        type: 'free-text',
        text: 'What processes does your organization use for detecting when hackers attempt to attack your IT systems?',
      },
      {
        id: 'mon-3',
        type: 'free-text',
        text: 'What processes does your organization use for generating and maintaining audit logs of internal system activity?',
      },
      {
        id: 'mon-4',
        type: 'free-text',
        text: 'What processes do you have in place currently for requiring/forcing password changes (especially following a security event)?',
      },
      {
        id: 'mon-5',
        type: 'yes-no',
        text: 'In the event of a computer destruction or device loss, does your organization have written policies and procedures for restoring network services and access to ePHI?\n\nAdditionally, are all relevant staff members aware of their roles and responsibilities in such a scenario?',
        remediation: 'Develop documented procedures for restoring network services and ePHI access after device loss or destruction. Ensure all relevant staff are trained on their specific roles and responsibilities.',
      },
      {
        id: 'mon-6',
        type: 'yes-no',
        text: 'Do employees receive training that includes language prohibiting personal email accounts and software installation?',
        remediation: 'Update training to explicitly prohibit use of personal email for PHI and unauthorized software installation. Include in acceptable use policy.',
      },
      {
        id: 'mon-7',
        type: 'free-text',
        text: 'What antivirus software, firewalls, and other security tools does your organization currently use to protect user information from malware, spyware, and viruses?',
      },
      {
        id: 'mon-8',
        type: 'free-text',
        text: 'How does your organization document security incident reports and the actions taken in response to those incidents?',
      },
    ],
  },
  {
    id: 'backup-disaster',
    title: 'Backup & Disaster Recovery',
    description: 'Off-site backups, relocation planning, and data recovery procedures',
    icon: 'cloud-arrow-up',
    questions: [
      {
        id: 'bdr-1',
        type: 'yes-no',
        text: 'Do you maintain off-site backups of your data, stored in a location separate from your main office, to ensure data recovery if the office is damaged or destroyed?',
        remediation: 'Implement off-site backup storage in a geographically separate location. Encrypt all backup media. Test restoration procedures regularly.',
      },
      {
        id: 'bdr-2',
        type: 'yes-no',
        text: 'Does your organization have a plan in place to maintain HIPAA compliance and protect sensitive data if you need to temporarily relocate operations due to a natural disaster?\n\nFor example - the rental of a temporary office space.',
        remediation: 'Develop a business continuity plan that addresses HIPAA compliance during temporary relocation. Include provisions for securing PHI in alternative work environments.',
      },
      {
        id: 'bdr-3',
        type: 'free-text',
        text: 'How will you ensure compliance in this new environment?',
      },
      {
        id: 'bdr-4',
        type: 'free-text',
        text: 'If your organization must operate from a temporary location due to unforeseen events, what measures will you implement to ensure the continued protection of patient health information?',
      },
    ],
  },
  {
    id: 'physical-security',
    title: 'Physical Security',
    description: 'Facility access controls, workstation security, and device/media protection',
    icon: 'lock-closed',
    questions: [
      {
        id: 'phy-1',
        type: 'free-text',
        text: 'If you make plans to move around the office layout at your company, do you take appropriate steps to avoid disclosing PHI? How do you determine the efficacy of this?',
      },
      {
        id: 'phy-2',
        type: 'free-text',
        text: 'What strategies and safeguards does your organization use to handle potential risks related to the security of PHI?',
      },
      {
        id: 'phy-3',
        type: 'yes-no',
        text: 'Does your organization use physical security measures such as door locks, security cameras, or locking cabinets to prevent unauthorized access to your facility?\nIf so, please specify which safeguards are in place within the field below.',
        remediation: 'Install physical security measures including door locks, security cameras, and locking cabinets in areas where PHI is stored or accessed. Document all security measures in place.',
      },
      {
        id: 'phy-4',
        type: 'yes-no',
        text: 'When physical security measures such as door locks, security cameras, or locking cabinets require maintenance, modification, or repair, does your company keep a timestamped record of these visits?',
        remediation: 'Implement a maintenance log for all physical security measures. Record date, time, nature of work, and personnel involved for each maintenance visit.',
      },
      {
        id: 'phy-5',
        type: 'yes-no',
        text: 'Are computers positioned at your facility in a way that ensures PHI seen onscreen by employees is not visible to other individuals?',
        remediation: 'Reposition monitors away from public areas and walkways. Install privacy screen filters on workstations in shared or patient-facing spaces.',
      },
      {
        id: 'phy-6',
        type: 'yes-no',
        text: 'Does your organization use automatic logoff functions on devices after a period of inactivity?',
        remediation: 'Configure automatic screen lock and logoff after 10-15 minutes of inactivity on all workstations. Enforce via Group Policy or MDM.',
      },
      {
        id: 'phy-7',
        type: 'yes-no',
        text: 'When you dispose of, or replace computers, do you do so in a secure and compliant fashion?',
        remediation: 'Implement media disposal procedures following NIST 800-88 guidelines. Use certified data destruction for hard drives. Obtain destruction certificates.',
      },
      {
        id: 'phy-8',
        type: 'yes-no',
        text: 'Does your organization maintain an asset inventory that contains assignee and location of device?',
        remediation: 'Create and maintain a comprehensive asset inventory including device type, assignee, location, and ePHI access status. Update whenever assets are reassigned or moved.',
      },
      {
        id: 'phy-9',
        type: 'free-text',
        text: 'How often does your company back up user and patient data to ensure its confidentiality, integrity, and availability?',
      },
      {
        id: 'phy-10',
        type: 'yes-no',
        text: 'Does your company have an action plan for safeguarding physical sources of PHI?\n\nFor example, paper records.',
        remediation: 'Develop and document procedures for safeguarding physical PHI including paper records. Include secure storage, handling, transport, and destruction procedures.',
      },
    ],
  },
  {
    id: 'encryption-data',
    title: 'Encryption & Data Protection',
    description: 'Encryption practices, minimum necessary access, and email security',
    icon: 'lock-closed',
    questions: [
      {
        id: 'enc-1',
        type: 'yes-no',
        text: 'Does your organization use encryption to protect ePHI?',
        remediation: 'Implement encryption for all ePHI at rest and in transit. Use AES-256 or equivalent for stored data and TLS 1.2+ for data in transit.',
      },
      {
        id: 'enc-2',
        type: 'free-text',
        text: 'What processes does your organization employ to monitor staff activity on internal computer networks and software applications?',
      },
      {
        id: 'enc-3',
        type: 'yes-no',
        text: 'Do staff members have access only to the minimum necessary amount of PHI required to perform their job?',
        remediation: 'Review and adjust access permissions based on job roles. Implement role-based access control (RBAC). Conduct annual access reviews with department managers.',
      },
      {
        id: 'enc-4',
        type: 'free-text',
        text: 'How do you verify that employees do, in fact, have only the minimum amount of protected health information necessary to carry out their job functions?',
      },
      {
        id: 'enc-5',
        type: 'yes-no',
        text: 'Does your organization ever use email to send ePHI within the office?',
        remediation: 'Implement secure email policies for internal ePHI transmission. Consider using encrypted email solutions or secure messaging platforms instead.',
      },
      {
        id: 'enc-6',
        type: 'yes-no',
        text: 'If the answer to the above question is \'Yes,\' are the emails encrypted?',
        remediation: 'Implement email encryption for all internal communications containing ePHI. Use TLS, S/MIME, or a dedicated encrypted email solution.',
      },
      {
        id: 'enc-7',
        type: 'yes-no',
        text: 'Does your organization ever send ePHI to patients via email?',
        remediation: 'Implement secure email policies for patient communications containing ePHI. Consider using a patient portal instead of email for sharing PHI.',
      },
      {
        id: 'enc-8',
        type: 'yes-no',
        text: 'If the answer to the above question is \'Yes,\' are you encrypting these emails sent to patients which contain PHI?',
        remediation: 'Implement email encryption for all patient communications containing PHI. Use a HIPAA-compliant encrypted email solution.',
      },
      {
        id: 'enc-9',
        type: 'yes-no',
        text: 'Is employee access to sensitive systems restricted automatically after numerous failed login attempts?',
        remediation: 'Configure account lockout after 5 failed attempts with a 30-minute lockout duration. Monitor and alert on lockout events. Review lockout logs for potential attack patterns.',
      },
      {
        id: 'enc-10',
        type: 'free-text',
        text: 'How does your organization make sure that sensitive information is encrypted both when stored (at rest) and during transmission (in motion)?',
      },
    ],
  },
  {
    id: 'breach-response',
    title: 'Breach Response & Reporting',
    description: 'Breach notification procedures, reporting channels, and risk management',
    icon: 'bell-alert',
    questions: [
      {
        id: 'brp-1',
        type: 'free-text',
        text: 'What processes or channels does your organization provide to enable employees to report breaches of PHI?',
      },
      {
        id: 'brp-2',
        type: 'free-text',
        text: 'What steps should an employee follow to report a potential information breach within your organization?',
      },
      {
        id: 'brp-3',
        type: 'yes-no',
        text: 'Do your third-party business associates know whom to contact within your organization if they experience or identify a breach?',
        remediation: 'Maintain updated emergency contact information for all Business Associates. Include breach notification contacts in all BAAs. Test communication channels annually.',
      },
      {
        id: 'brp-4',
        type: 'free-text',
        text: 'How does your company identify and handle possible technical risks to your IT systems and ePHI?',
      },
      {
        id: 'brp-5',
        type: 'yes-no',
        text: 'Do your employees understand how to effectively employ the \'minimum necessary rule\'?',
        remediation: 'Train all employees on the minimum necessary standard. Provide role-specific examples. Include in onboarding and annual refresher training.',
      },
    ],
  },
  {
    id: 'healthcare-privacy',
    title: 'Healthcare-Specific (Privacy Practices)',
    description: 'Notice of Privacy Practices, patient rights, and personnel risk management',
    icon: 'heart',
    questions: [
      {
        id: 'hcp-1',
        type: 'yes-no',
        text: 'If your practice still uses paper charts, do you make sure that patient names are facing away on charts while patients are waiting to be seen?',
        remediation: 'Implement procedures to ensure patient names on charts face away from view in waiting and public areas. Train staff on proper chart handling.',
      },
      {
        id: 'hcp-2',
        type: 'yes-no',
        text: 'Do you hang your Notice of Privacy Practices throughout your office to make sure patients are informed regarding their rights?',
        remediation: 'Post the Notice of Privacy Practices in prominent locations throughout your facility, including waiting areas, exam rooms, and reception.',
      },
      {
        id: 'hcp-3',
        type: 'yes-no',
        text: 'Do you make sure that your Notice of Privacy Practices is easily accessible to patients?',
        remediation: 'Ensure the Notice of Privacy Practices is readily available in print at the front desk and posted on your website. Offer copies to all patients.',
      },
      {
        id: 'hcp-4',
        type: 'yes-no',
        text: 'Do you obtain each patient\'s signature, showing they have received their Notice of Privacy Practices?',
        remediation: 'Implement a process to obtain patient signatures acknowledging receipt of the Notice of Privacy Practices. Retain signed acknowledgments in patient records.',
      },
      {
        id: 'hcp-5',
        type: 'free-text',
        text: 'What strategies and safeguards does your organization have in place to prevent and address personnel-related risks, including the potential misuse of Protected Health Information (PHI)?',
      },
    ],
  },
];

/**
 * Get all questions flattened from all categories
 */
export function getAllQuestions(): SRAQuestion[] {
  return SRA_CATEGORIES.flatMap((cat) => cat.questions);
}

/**
 * Get only yes/no questions (the ones that count toward scoring)
 */
export function getYesNoQuestions(): SRAQuestion[] {
  return getAllQuestions().filter((q) => q.type === 'yes-no');
}

/**
 * Calculate SRA compliance score
 * Only Yes/No questions count toward the compliance score.
 * Free text and multiple choice are documented but don't affect the score.
 */
export function calculateSRAScore(results: SRACategoryResult[]): {
  score: number;
  totalQuestions: number;
  totalScoredQuestions: number;
  compliantCount: number;
  gapCount: number;
  categoryScores: Record<string, number>;
  gaps: SRAGapItem[];
} {
  let totalQuestions = 0;
  let totalScoredQuestions = 0;
  let compliantCount = 0;
  let gapCount = 0;
  const categoryScores: Record<string, number> = {};
  const gaps: SRAGapItem[] = [];

  results.forEach((result) => {
    const category = SRA_CATEGORIES.find((c) => c.id === result.categoryId);
    if (!category) return;

    let categoryCompliant = 0;
    let categoryScoredTotal = 0;

    result.responses.forEach((response) => {
      totalQuestions++;

      const question = category.questions.find((q) => q.id === response.questionId);
      if (!question) return;

      // Only yes/no questions affect the score
      if (question.type === 'yes-no') {
        totalScoredQuestions++;
        categoryScoredTotal++;

        if (response.answer === 'yes') {
          compliantCount++;
          categoryCompliant++;
        } else if (response.answer === 'no') {
          gapCount++;

          if (question.remediation) {
            gaps.push({
              categoryId: category.id,
              categoryTitle: category.title,
              questionId: question.id,
              questionText: question.text,
              answer: 'no',
              remediation: question.remediation,
              notes: response.notes,
            });
          }
        }
      }
    });

    categoryScores[result.categoryId] = categoryScoredTotal > 0
      ? (categoryCompliant / categoryScoredTotal) * 100
      : 100;
  });

  const score = totalScoredQuestions > 0 ? (compliantCount / totalScoredQuestions) * 100 : 0;

  return {
    score,
    totalQuestions,
    totalScoredQuestions,
    compliantCount,
    gapCount,
    categoryScores,
    gaps,
  };
}

/**
 * Export SRA report as Markdown
 */
export function exportSRAReportMarkdown(report: SRAReport): string {
  const scoring = calculateSRAScore(report.results);

  let markdown = '# Security Risk Assessment Report\n\n';
  markdown += `**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  markdown += `**Assessment Period:** ${new Date(report.startedAt).toLocaleDateString()} - ${report.completedAt ? new Date(report.completedAt).toLocaleDateString() : 'In Progress'}\n\n`;

  markdown += '## Executive Summary\n\n';
  markdown += `**Overall Compliance Score:** ${scoring.score.toFixed(1)}% (based on ${scoring.totalScoredQuestions} Yes/No questions)\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Questions Answered | ${scoring.totalQuestions} |\n`;
  markdown += `| Scored Questions (Yes/No) | ${scoring.totalScoredQuestions} |\n`;
  markdown += `| Compliant (Yes) | ${scoring.compliantCount} |\n`;
  markdown += `| Non-Compliant (No) | ${scoring.gapCount} |\n\n`;

  markdown += '## Category Breakdown\n\n';
  markdown += '| Category | Compliance Score |\n';
  markdown += '|----------|------------------|\n';
  SRA_CATEGORIES.forEach((category) => {
    const catScore = scoring.categoryScores[category.id];
    if (catScore !== undefined) {
      const yesNoCount = category.questions.filter((q) => q.type === 'yes-no').length;
      if (yesNoCount > 0) {
        markdown += `| ${category.title} | ${catScore.toFixed(1)}% |\n`;
      } else {
        markdown += `| ${category.title} | Documentation Only |\n`;
      }
    }
  });
  markdown += '\n';

  markdown += '## Gap Analysis\n\n';
  if (scoring.gaps.length > 0) {
    markdown += `${scoring.gaps.length} gap(s) identified requiring remediation:\n\n`;

    scoring.gaps.forEach((gap, index) => {
      markdown += `### ${index + 1}. ${gap.categoryTitle}\n\n`;
      markdown += `**Status:** NON-COMPLIANT\n\n`;
      markdown += `**Question:** ${gap.questionText}\n\n`;
      markdown += `**Remediation:** ${gap.remediation}\n\n`;
      if (gap.notes) {
        markdown += `**Notes:** ${gap.notes}\n\n`;
      }
      markdown += '---\n\n';
    });
  } else {
    markdown += 'No gaps identified. All assessed Yes/No controls are compliant.\n\n';
  }

  markdown += '## Detailed Responses\n\n';
  report.results.forEach((result) => {
    const category = SRA_CATEGORIES.find((c) => c.id === result.categoryId);
    if (!category) return;

    markdown += `### ${category.title}\n\n`;

    result.responses.forEach((response) => {
      const question = category.questions.find((q) => q.id === response.questionId);
      if (!question) return;

      markdown += `- **${question.text}**\n`;

      if (question.type === 'yes-no') {
        markdown += `  - Answer: ${response.answer === 'yes' ? 'Yes' : 'No'}\n`;
      } else if (question.type === 'multiple-choice') {
        markdown += `  - Selected: ${response.answer}\n`;
      } else {
        markdown += `  - Response: ${response.answer || '(No response provided)'}\n`;
      }

      if (response.notes) {
        markdown += `  - Notes: ${response.notes}\n`;
      }
    });

    markdown += '\n';
  });

  markdown += '---\n\n';
  markdown += '*This Security Risk Assessment should be reviewed and updated at least annually or after significant changes to systems, processes, or threats.*\n';

  return markdown;
}

/**
 * Export SRA report as CSV
 */
export function exportSRAReportCSV(report: SRAReport): string {
  let csv = 'Question ID,Category,Question Type,Question,Answer,Remediation,Notes\n';

  report.results.forEach((result) => {
    const category = SRA_CATEGORIES.find((c) => c.id === result.categoryId);
    if (!category) return;

    result.responses.forEach((response) => {
      const question = category.questions.find((q) => q.id === response.questionId);
      if (!question) return;

      let answerLabel: string;
      if (question.type === 'yes-no') {
        answerLabel = response.answer === 'yes' ? 'Yes' : 'No';
      } else {
        answerLabel = response.answer || '';
      }

      const remediation = question.type === 'yes-no' && response.answer === 'no' && question.remediation
        ? question.remediation
        : '';

      const csvLine = [
        question.id,
        `"${category.title.replace(/"/g, '""')}"`,
        question.type,
        `"${question.text.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${answerLabel.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${remediation.replace(/"/g, '""')}"`,
        `"${(response.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      ].join(',');

      csv += csvLine + '\n';
    });
  });

  return csv;
}
