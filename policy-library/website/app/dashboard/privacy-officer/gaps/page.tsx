'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  ShieldExclamationIcon,
  QuestionMarkCircleIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { orgStorage } from '@/lib/supabase/org-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GapItem {
  id: number;
  question: string;
  regulationLinks: { label: string; url: string }[];
  productLinks: { label: string; url: string }[];
  category: string;
  hasGuidance: boolean;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'All',
  'Risk Assessment',
  'Personnel & Compliance Officer',
  'Business Associates',
  'Training & Awareness',
  'Policies & Procedures',
  'Access Controls',
  'Workstation & Physical Security',
  'Device & Media Controls',
  'Incident Response',
  'Encryption & Transmission',
  'Patient Privacy (Healthcare)',
] as const;

type Category = (typeof CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Complete Gap Data (45 items)
// ---------------------------------------------------------------------------

const GAP_DATA: GapItem[] = [
  {
    id: 1,
    question: 'Has your company conducted a Security Risk Assessment (SRA) in the last year?',
    regulationLinks: [
      { label: 'Security Analysis', url: 'https://www.ecfr.gov/current/title-45/part-164#p-164.308(a)(1)(ii)(A)' },
    ],
    productLinks: [
      { label: 'Ongoing Security Risk Assessment', url: 'https://www.oneguyconsulting.com/product/ongoing-security-risk-assessment/' },
    ],
    category: 'Risk Assessment',
    hasGuidance: true,
  },
  {
    id: 2,
    question: 'Have you appointed a qualified individual to serve as Compliance Officer?',
    regulationLinks: [
      { label: 'Personnel Designations', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(a)(1)' },
    ],
    productLinks: [
      { label: 'Admin Safeguards Assigned Sec Responsibility', url: 'https://www.oneguyconsulting.com/product/admin-safeguards-assigned-sec-responsibility/' },
    ],
    category: 'Personnel & Compliance Officer',
    hasGuidance: true,
  },
  {
    id: 3,
    question: 'Can you list all physical and digital locations where your company holds, modifies or transmits ePHI?',
    regulationLinks: [],
    productLinks: [],
    category: 'Risk Assessment',
    hasGuidance: false,
  },
  {
    id: 4,
    question: 'Does your organization keep an up-to-date listing of all hardware devices that may TOUCH electronic protected health information (ePHI)?',
    regulationLinks: [
      { label: 'Security Management Process', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(1)(ii)(A)' },
      { label: 'Device and Media Controls', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(d)(1)' },
    ],
    productLinks: [
      { label: 'Device and Media Controls', url: 'https://www.oneguyconsulting.com/product/device-and-media-controls' },
      { label: 'Admin Safeguards', url: 'https://www.oneguyconsulting.com/product/admin-safeguards-assigned-sec-responsibility/' },
    ],
    category: 'Device & Media Controls',
    hasGuidance: true,
  },
  {
    id: 5,
    question: 'Do any Business Associates, or other entities have any access to your organization\'s technology systems or digital environment?',
    regulationLinks: [
      { label: 'Business Associate Contracts', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.504#p-164.504(e)(1)' },
    ],
    productLinks: [
      { label: 'BA Agreement Policy', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-policy/' },
      { label: 'BA Agreement Template', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-template/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 6,
    question: 'Do any Business Associates have the access to modify PHI or user information?',
    regulationLinks: [
      { label: 'Business Associate Contracts', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.504#p-164.504(e)(1)' },
    ],
    productLinks: [
      { label: 'BA Agreement Policy', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-policy/' },
      { label: 'BA Agreement Template', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-template/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 7,
    question: 'Are all Business Associate Agreements in place and current for third-parties that have access to PHI?',
    regulationLinks: [
      { label: 'Business Associate Contracts', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.504#p-164.504(e)(1)' },
    ],
    productLinks: [
      { label: 'BA Agreement Policy', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-policy/' },
      { label: 'BA Agreement Template', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-template/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 8,
    question: 'Do all existing Business Associate Agreements discuss requiring third parties to safeguard PHI?',
    regulationLinks: [
      { label: 'Business Associate Contracts', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.504#p-164.504(e)(1)' },
    ],
    productLinks: [
      { label: 'BA Agreement Policy', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-policy/' },
      { label: 'BA Agreement Template', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-template/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 9,
    question: 'Do your Business Associate Agreements include indemnification statements outlining actions if a breach is caused by the business associate?',
    regulationLinks: [
      { label: 'Business Associate Contracts', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.504#p-164.504(e)(1)' },
    ],
    productLinks: [
      { label: 'BA Agreement Policy', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-policy/' },
      { label: 'BA Agreement Template', url: 'https://www.oneguyconsulting.com/product/business-associate-agreement-template/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 10,
    question: 'Have all employees in your organization received HIPAA 101 training?',
    regulationLinks: [
      { label: 'Training Standard', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(b)(1)' },
    ],
    productLinks: [
      { label: 'Workforce Training', url: 'https://www.oneguyconsulting.com/product/workforce-training-and-security-awareness/' },
      { label: 'HIPAA 101 Training', url: 'https://oneguyconsulting.com/product/hipaa-101-training/' },
    ],
    category: 'Training & Awareness',
    hasGuidance: true,
  },
  {
    id: 11,
    question: 'Have all employees received training on CyberSecurity Awareness?',
    regulationLinks: [
      { label: 'Security Awareness and Training', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(i)' },
    ],
    productLinks: [
      { label: 'Workforce Training', url: 'https://www.oneguyconsulting.com/product/workforce-training-and-security-awareness/' },
      { label: 'CyberSecurity Training', url: 'https://oneguyconsulting.com/product/cybersecurity-awareness-training/' },
    ],
    category: 'Training & Awareness',
    hasGuidance: true,
  },
  {
    id: 12,
    question: 'Do your employees currently have access to up-to-date policy and procedure documents?',
    regulationLinks: [
      { label: 'Policies and Procedures Standard', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(i)' },
    ],
    productLinks: [
      { label: 'Policies Procedures Documentation', url: 'https://oneguyconsulting.com/product/policies-procedures-documentation-policy/' },
    ],
    category: 'Policies & Procedures',
    hasGuidance: true,
  },
  {
    id: 13,
    question: 'Are employees aware that adherence to HIPAA compliance policies is mandatory and violations may result in termination?',
    regulationLinks: [
      { label: 'Privacy Rule Sanctions', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(e)(1)' },
      { label: 'Security Rule Sanctions', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(1)(ii)(C)' },
    ],
    productLinks: [
      { label: 'Sanctions Policy', url: 'https://www.oneguyconsulting.com/product/sanctions-policy/' },
    ],
    category: 'Policies & Procedures',
    hasGuidance: true,
  },
  {
    id: 14,
    question: 'Do all employees who use systems containing PHI have their own unique user IDs?',
    regulationLinks: [
      { label: 'Unique User ID', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(a)(2)(i)' },
    ],
    productLinks: [
      { label: 'Unique User ID Policy', url: 'https://oneguyconsulting.com/product/unique-user-id-policy/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 15,
    question: "Does each employee's unique user ID require its own individual, user-created password?",
    regulationLinks: [
      { label: 'Password Management', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(ii)(D)' },
    ],
    productLinks: [
      { label: 'Password Authentication Management', url: 'https://www.oneguyconsulting.com/product/password-authentication-management-policy/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 16,
    question: 'Do you train staff to not share passwords?',
    regulationLinks: [
      { label: 'Password Management', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(ii)(D)' },
    ],
    productLinks: [
      { label: 'Password Authentication Management', url: 'https://www.oneguyconsulting.com/product/password-authentication-management-policy/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 17,
    question: "Are employees following a 'clean desk' mandate?",
    regulationLinks: [
      { label: 'Workstation Use', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(b)' },
      { label: 'Workstation Security', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(c)' },
    ],
    productLinks: [
      { label: 'Workstation Use Policy', url: 'https://www.oneguyconsulting.com/product/workstation-use-policy/' },
      { label: 'Workstation Security Policy', url: 'https://www.oneguyconsulting.com/product/workstation-security-policy/' },
    ],
    category: 'Workstation & Physical Security',
    hasGuidance: true,
  },
  {
    id: 18,
    question: 'Do you ensure new hires are trained on HIPAA policies, HIPAA 101, and CyberSecurity Awareness during onboarding?',
    regulationLinks: [
      { label: 'Training Requirements', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(b)(1)' },
      { label: 'Security Awareness and Training', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(i)' },
    ],
    productLinks: [
      { label: 'Workforce Training', url: 'https://www.oneguyconsulting.com/product/workforce-training-and-security-awareness/' },
    ],
    category: 'Training & Awareness',
    hasGuidance: true,
  },
  {
    id: 19,
    question: 'Does your staff know who serves as organizational Compliance Officer?',
    regulationLinks: [
      { label: 'Personnel Designations', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(a)(1)' },
    ],
    productLinks: [
      { label: 'Admin Safeguards', url: 'https://www.oneguyconsulting.com/product/admin-safeguards-and-assigned-sec-responsibility/' },
    ],
    category: 'Personnel & Compliance Officer',
    hasGuidance: true,
  },
  {
    id: 20,
    question: 'Do employees know they are required to report any suspected security incidents to the Compliance Officer?',
    regulationLinks: [
      { label: 'Security Incident Procedures', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(6)(i)' },
    ],
    productLinks: [
      { label: 'Security Incident Response', url: 'https://www.oneguyconsulting.com/product/security-incident-response-and-reporting/' },
    ],
    category: 'Incident Response',
    hasGuidance: true,
  },
  {
    id: 21,
    question: 'Do you have policies and procedures in place to deal with the risk of human error?',
    regulationLinks: [
      { label: 'Risk Management', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(1)(ii)(B)' },
    ],
    productLinks: [
      { label: 'Risk Management Policy', url: 'https://oneguyconsulting.com/product/risk-management-policy/' },
    ],
    category: 'Policies & Procedures',
    hasGuidance: true,
  },
  {
    id: 22,
    question: 'Is there a record kept that contains timestamps for when employee training sessions occur?',
    regulationLinks: [
      { label: 'Training Standard', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(b)(1)' },
    ],
    productLinks: [
      { label: 'Workforce Training', url: 'https://www.oneguyconsulting.com/product/workforce-training-and-security-awareness' },
    ],
    category: 'Training & Awareness',
    hasGuidance: true,
  },
  {
    id: 23,
    question: 'What processes do you have in place for requiring password changes (especially following a security event)?',
    regulationLinks: [
      { label: 'Password Management', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(ii)(D)' },
      { label: 'Security Incident Procedures', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(6)(i)' },
    ],
    productLinks: [
      { label: 'Password Authentication Management', url: 'https://oneguyconsulting.com/product/password-authentication-management-policy/' },
      { label: 'Security Incident Response', url: 'https://oneguyconsulting.com/product/security-incident-response-and-reporting/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 24,
    question: 'In the event of a computer destruction or device loss, does your organization have written policies for restoring network services and access to ePHI?',
    regulationLinks: [
      { label: 'Contingency Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(i)' },
    ],
    productLinks: [
      { label: 'Disaster Recovery', url: 'https://www.oneguyconsulting.com/disaster-recovery-contingency-planning' },
    ],
    category: 'Incident Response',
    hasGuidance: true,
  },
  {
    id: 25,
    question: 'Do employees receive training that includes language prohibiting personal email accounts and software installation?',
    regulationLinks: [
      { label: 'Security Awareness and Training', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(i)' },
    ],
    productLinks: [
      { label: 'Workforce Training', url: 'https://oneguyconsulting.com/product/workforce-training-and-security-awareness/' },
    ],
    category: 'Training & Awareness',
    hasGuidance: true,
  },
  {
    id: 26,
    question: 'Do you maintain off-site backups of your data?',
    regulationLinks: [
      { label: 'Contingency Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(i)' },
      { label: 'Data Backup Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(ii)(A)' },
      { label: 'Disaster Recovery Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(ii)(B)' },
      { label: 'Emergency Mode Operation Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(ii)(C)' },
    ],
    productLinks: [
      { label: 'Security Incident Response', url: 'https://www.oneguyconsulting.com/product/security-incident-response-and-reporting' },
      { label: 'Disaster Recovery', url: 'https://www.oneguyconsulting.com/product/disaster-recovery-contingency-planning' },
      { label: 'Data Backup Storage', url: 'https://oneguyconsulting.com/product/data-backup-storage/' },
    ],
    category: 'Incident Response',
    hasGuidance: true,
  },
  {
    id: 27,
    question: 'Does your organization have a plan to maintain HIPAA compliance if you need to temporarily relocate operations due to a natural disaster?',
    regulationLinks: [
      { label: 'Contingency Plan', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(7)(i)' },
    ],
    productLinks: [
      { label: 'Disaster Recovery', url: 'https://www.oneguyconsulting.com/product/disaster-recovery-contingency-planning' },
    ],
    category: 'Incident Response',
    hasGuidance: true,
  },
  {
    id: 28,
    question: 'When physical security measures require maintenance, does your company keep a timestamped record of these visits?',
    regulationLinks: [
      { label: 'Maintenance Records', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(a)(2)(iv)' },
    ],
    productLinks: [
      { label: 'Physical Security and Visitor Access', url: 'https://www.oneguyconsulting.com/product/physical-security-and-visitor-access-policy/' },
    ],
    category: 'Workstation & Physical Security',
    hasGuidance: true,
  },
  {
    id: 29,
    question: 'Are computers positioned so that PHI onscreen is not visible to other individuals?',
    regulationLinks: [
      { label: 'Workstation Security', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(c)' },
    ],
    productLinks: [
      { label: 'Workstation Security Policy', url: 'https://www.oneguyconsulting.com/product/workstation-security-policy/' },
    ],
    category: 'Workstation & Physical Security',
    hasGuidance: true,
  },
  {
    id: 30,
    question: 'Does your organization use automatic logoff functions on devices after inactivity?',
    regulationLinks: [
      { label: 'Automatic Logoff', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(a)(2)(iii)' },
    ],
    productLinks: [
      { label: 'Automatic Logoff', url: 'https://www.oneguyconsulting.com/product/automatic-logoff/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 31,
    question: 'Does your organization maintain an asset inventory that contains assignee and location of device?',
    regulationLinks: [
      { label: 'Device and Media Controls', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.310#p-164.310(d)(1)' },
    ],
    productLinks: [
      { label: 'Device and Media Controls', url: 'https://www.oneguyconsulting.com/product/device-and-media-controls' },
    ],
    category: 'Device & Media Controls',
    hasGuidance: true,
  },
  {
    id: 32,
    question: 'Does your company have an action plan for safeguarding physical sources of PHI?',
    regulationLinks: [
      { label: 'Physical Safeguards', url: 'https://www.ecfr.gov/current/title-45/section-164.310' },
    ],
    productLinks: [
      { label: 'Physical Security and Visitor Access', url: 'https://www.oneguyconsulting.com/product/physical-security-and-visitor-access-policy' },
    ],
    category: 'Workstation & Physical Security',
    hasGuidance: true,
  },
  {
    id: 33,
    question: 'Does your organization use encryption to protect ePHI?',
    regulationLinks: [
      { label: 'Encryption and Decryption', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(a)(2)(iv)' },
    ],
    productLinks: [
      { label: 'Encryption Decryption and Transmission Security', url: 'https://www.oneguyconsulting.com/product/encryption-decryption-and-transmission-security-policy' },
    ],
    category: 'Encryption & Transmission',
    hasGuidance: true,
  },
  {
    id: 34,
    question: 'Do staff members have access only to the minimum necessary amount of PHI?',
    regulationLinks: [
      { label: 'Minimum Necessary Rule', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.514#p-164.514(d)(1)' },
    ],
    productLinks: [
      { label: 'Minimum Necessary Policy', url: 'https://www.oneguyconsulting.com/product/minimum-necessary-policy' },
    ],
    category: 'Encryption & Transmission',
    hasGuidance: true,
  },
  {
    id: 35,
    question: 'Does your organization ever use email to send ePHI within the office?',
    regulationLinks: [
      { label: 'Encryption', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(a)(2)(iv)' },
      { label: 'Transmission Security', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(e)(1)' },
    ],
    productLinks: [
      { label: 'Encryption Decryption and Transmission Security', url: 'https://www.oneguyconsulting.com/product/encryption-decryption-and-transmission-security-policy' },
    ],
    category: 'Encryption & Transmission',
    hasGuidance: true,
  },
  {
    id: 36,
    question: "If the answer to the above question is 'Yes,' are the emails encrypted?",
    regulationLinks: [],
    productLinks: [],
    category: 'Encryption & Transmission',
    hasGuidance: false,
  },
  {
    id: 37,
    question: 'Does your organization ever send ePHI to patients via email?',
    regulationLinks: [
      { label: 'Encryption', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(e)(2)(ii)' },
    ],
    productLinks: [
      { label: 'Encryption Decryption and Transmission Security', url: 'https://www.oneguyconsulting.com/product/encryption-decryption-and-transmission-security-policy/' },
    ],
    category: 'Encryption & Transmission',
    hasGuidance: true,
  },
  {
    id: 38,
    question: "If the answer to the above question is 'Yes,' are you encrypting these emails sent to patients?",
    regulationLinks: [
      { label: 'Encryption at rest', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(a)(2)(iv)' },
      { label: 'Encryption in motion', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(e)(2)(ii)' },
    ],
    productLinks: [
      { label: 'Encryption Decryption and Transmission Security', url: 'https://www.oneguyconsulting.com/product/encryption-decryption-and-transmission-security-policy/' },
    ],
    category: 'Encryption & Transmission',
    hasGuidance: true,
  },
  {
    id: 39,
    question: 'Is employee access to sensitive systems restricted automatically after numerous failed login attempts?',
    regulationLinks: [
      { label: 'Login Monitoring', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.308#p-164.308(a)(5)(ii)(C)' },
      { label: 'Person or Entity Authentication', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.312#p-164.312(d)' },
    ],
    productLinks: [
      { label: 'Log-in Monitoring', url: 'https://www.oneguyconsulting.com/product/log-in-monitoring' },
      { label: 'Verification', url: 'https://www.oneguyconsulting.com/product/verification/' },
    ],
    category: 'Access Controls',
    hasGuidance: true,
  },
  {
    id: 40,
    question: 'Do your third-party business associates know whom to contact within your organization if they experience a breach?',
    regulationLinks: [
      { label: 'Breach Notification by Business Associate', url: 'https://www.ecfr.gov/current/title-45/section-164.410' },
    ],
    productLinks: [
      { label: 'Breach Notification Policy', url: 'https://oneguyconsulting.com/product/breach-notification-policy/' },
    ],
    category: 'Business Associates',
    hasGuidance: true,
  },
  {
    id: 41,
    question: "Do your employees understand how to effectively employ the 'minimum necessary rule'?",
    regulationLinks: [
      { label: 'Minimum Necessary Requirements', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.514#p-164.514(d)(1)' },
    ],
    productLinks: [
      { label: 'Minimum Necessary Policy', url: 'https://www.oneguyconsulting.com/product/minimum-necessary-policy/' },
    ],
    category: 'Patient Privacy (Healthcare)',
    hasGuidance: true,
  },
  {
    id: 42,
    question: 'If your practice still uses paper charts, do you make sure patient names are facing away while patients are waiting?',
    regulationLinks: [
      { label: 'Safeguard Standards', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.530#p-164.530(c)(2)(i)' },
    ],
    productLinks: [
      { label: 'Admin Safeguards', url: 'https://www.oneguyconsulting.com/product/admin-safeguards-assigned-sec-responsibility/' },
    ],
    category: 'Workstation & Physical Security',
    hasGuidance: true,
  },
  {
    id: 43,
    question: 'Do you hang your Notice of Privacy Practices throughout your office?',
    regulationLinks: [
      { label: 'Notice of Privacy Practices', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.520#p-164.520(c)(2)(iii)(B)' },
    ],
    productLinks: [
      { label: 'NPP Policy', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-policy' },
      { label: 'NPP Document', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-npp' },
    ],
    category: 'Patient Privacy (Healthcare)',
    hasGuidance: true,
  },
  {
    id: 44,
    question: 'Do you make sure that your Notice of Privacy Practices is easily accessible to patients?',
    regulationLinks: [
      { label: 'Notice of Privacy Practices', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.520#p-164.520(c)' },
    ],
    productLinks: [
      { label: 'NPP Policy', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-policy' },
      { label: 'NPP Document', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-npp' },
    ],
    category: 'Patient Privacy (Healthcare)',
    hasGuidance: true,
  },
  {
    id: 45,
    question: "Do you obtain each patient's signature, showing they have received their Notice of Privacy Practices?",
    regulationLinks: [
      { label: 'Notice of Privacy Practices', url: 'https://www.ecfr.gov/current/title-45/part-164/section-164.520#p-164.520(c)' },
    ],
    productLinks: [
      { label: 'NPP Policy', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-policy' },
      { label: 'NPP Document', url: 'https://www.oneguyconsulting.com/product/notice-of-privacy-practices-npp' },
    ],
    category: 'Patient Privacy (Healthcare)',
    hasGuidance: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of GAP_DATA) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return counts;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Risk Assessment': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Personnel & Compliance Officer': 'bg-copper-500/20 text-copper-300 border-copper-500/30',
  'Business Associates': 'bg-copper-500/20 text-copper-300 border-copper-500/30',
  'Training & Awareness': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Policies & Procedures': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Access Controls': 'bg-evergreen-500/20 text-evergreen-300 border-evergreen-500/30',
  'Workstation & Physical Security': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Device & Media Controls': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Incident Response': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'Encryption & Transmission': 'bg-evergreen-500/20 text-evergreen-300 border-evergreen-500/30',
  'Patient Privacy (Healthcare)': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'Risk Assessment': 'bg-red-400',
  'Personnel & Compliance Officer': 'bg-copper-400',
  'Business Associates': 'bg-copper-400',
  'Training & Awareness': 'bg-amber-400',
  'Policies & Procedures': 'bg-emerald-400',
  'Access Controls': 'bg-evergreen-400',
  'Workstation & Physical Security': 'bg-orange-400',
  'Device & Media Controls': 'bg-pink-400',
  'Incident Response': 'bg-rose-400',
  'Encryption & Transmission': 'bg-evergreen-400',
  'Patient Privacy (Healthcare)': 'bg-teal-400',
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function GapCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: GapItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[item.category] || 'bg-dark-500/20 text-dark-300 border-dark-500/30';

  return (
    <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-dark-600/70">
      {/* Collapsed header - always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4 group"
      >
        {/* Gap number */}
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-dark-700/60 flex items-center justify-center text-sm font-bold text-dark-300 mt-0.5">
          {item.id}
        </span>

        {/* Question and badges */}
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base text-dark-100 font-medium leading-relaxed pr-2">
            {item.question}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor}`}>
              {item.category}
            </span>
            {item.hasGuidance ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                <ShieldExclamationIcon className="h-3.5 w-3.5" />
                Non-Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                <QuestionMarkCircleIcon className="h-3.5 w-3.5" />
                Needs Review
              </span>
            )}
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <span className="flex-shrink-0 mt-1 text-dark-500 group-hover:text-dark-300 transition-colors">
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </span>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-dark-700/40">
          <div className="pt-4 space-y-4">
            {/* No guidance notice */}
            {!item.hasGuidance && (
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <strong className="font-semibold">No feedback provided.</strong>{' '}
                  This item requires further review to determine compliance status and appropriate remediation steps.
                </p>
              </div>
            )}

            {/* Regulation links */}
            {item.regulationLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2">
                  Applicable Regulations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.regulationLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-copper-400 hover:text-copper-300 transition-colors underline underline-offset-2 decoration-copper-400/30 hover:decoration-copper-300/50"
                    >
                      {link.label}
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Product links */}
            {item.productLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2">
                  Get Compliant
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.productLinks.map((link, idx) => {
                    const isTemplate =
                      link.label.toLowerCase().includes('template') ||
                      link.label.toLowerCase().includes('training') ||
                      link.label.toLowerCase().includes('hipaa 101') ||
                      link.label.toLowerCase().includes('cybersecurity');
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                          isTemplate
                            ? 'bg-gradient-to-r from-copper-600 to-copper-500 hover:from-copper-500 hover:to-copper-400 text-white shadow-lg shadow-copper-600/20'
                            : 'bg-gradient-to-r from-copper-600 to-copper-500 hover:from-copper-500 hover:to-copper-400 text-white shadow-lg shadow-copper-600/20'
                        }`}
                      >
                        {link.label}
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function GapsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [hasGeneratedPlans, setHasGeneratedPlans] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);
  const needsReviewCount = GAP_DATA.filter((g) => !g.hasGuidance).length;

  // Check if remediation plans have been generated from gaps
  useEffect(() => {
    try {
      const raw = orgStorage.getItem('hipaa-remediation-plans');
      if (raw) {
        const plans = JSON.parse(raw);
        if (Array.isArray(plans)) {
          const hasGapPlans = plans.some((p: any) => p.id && p.id.startsWith('gap-'));
          setHasGeneratedPlans(hasGapPlans);
        }
      }
    } catch (e) {
      console.error('Failed to check remediation plans:', e);
    }
  }, []);

  // Mark gap analysis as completed when user visits this page
  useEffect(() => {
    try {
      const existing = orgStorage.getItem('hipaa-gap-analysis');
      if (!existing) {
        orgStorage.setItem('hipaa-gap-analysis', JSON.stringify(GAP_DATA.map(g => ({ id: g.id, category: g.category, reviewed: true }))));
      }
    } catch (e) {
      console.error('Failed to save gap analysis state:', e);
    }
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return GAP_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.regulationLinks.some((r) => r.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.productLinks.some((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const allExpanded = filteredItems.length > 0 && filteredItems.every((i) => expandedIds.has(i.id));

  // Generate remediation plans from gap data
  const generateRemediationPlans = () => {
    try {
      const STORAGE_KEY = 'hipaa-remediation-plans';

      // Category mapping from gap categories to remediation categories
      const categoryMap: Record<string, string> = {
        'Risk Assessment': 'Administrative Safeguards',
        'Personnel & Compliance Officer': 'Administrative Safeguards',
        'Business Associates': 'Business Associates',
        'Training & Awareness': 'Administrative Safeguards',
        'Policies & Procedures': 'Administrative Safeguards',
        'Access Controls': 'Technical Safeguards',
        'Workstation & Physical Security': 'Physical Safeguards',
        'Device & Media Controls': 'Physical Safeguards',
        'Incident Response': 'Administrative Safeguards',
        'Encryption & Transmission': 'Technical Safeguards',
        'Patient Privacy (Healthcare)': 'General Compliance',
      };

      // Load existing plans
      const raw = orgStorage.getItem(STORAGE_KEY);
      let existingPlans: any[] = [];
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          // Keep only manually-created plans (not auto-generated gap plans)
          existingPlans = data.filter((p: any) => !p.id || !p.id.startsWith('gap-'));
        }
      }

      // Generate new plans from gap data
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 90); // 90 days from now
      const dueDateISO = dueDate.toISOString().split('T')[0];

      const newPlans = GAP_DATA.map((item) => {
        // Build description with regulation and product links
        let description = item.question;

        if (item.regulationLinks.length > 0) {
          description += '\n\n**Applicable Regulations:**\n';
          item.regulationLinks.forEach((link) => {
            description += `- [${link.label}](${link.url})\n`;
          });
        }

        if (item.productLinks.length > 0) {
          description += '\n**Resources:**\n';
          item.productLinks.forEach((link) => {
            description += `- [${link.label}](${link.url})\n`;
          });
        }

        // Truncate title if needed
        let title = `Remediate: ${item.question}`;
        if (title.length > 100) {
          title = title.substring(0, 97) + '...';
        }

        // Map category
        const category = categoryMap[item.category] || 'General Compliance';

        // Set priority based on hasGuidance (Non-Compliant = high, Needs Review = medium)
        const priority = item.hasGuidance ? 'high' : 'medium';

        // Extract HIPAA references
        const hipaaReference = item.regulationLinks.map((r) => r.label).join(', ');

        return {
          id: `gap-${item.id}`,
          title,
          description,
          category,
          priority,
          status: 'open',
          assignee: '',
          dueDate: dueDateISO,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          notes: '',
          hipaaReference,
          source: 'Gap Analysis',
        };
      });

      // Combine and save
      const allPlans = [...existingPlans, ...newPlans];
      orgStorage.setItem(STORAGE_KEY, JSON.stringify(allPlans));

      setHasGeneratedPlans(true);
      setShowGenerateConfirm(false);
      setShowSuccessMessage(true);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (e) {
      console.error('Failed to generate remediation plans:', e);
      alert('Failed to generate remediation plans. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Gap Analysis Report
            </h1>
            <p className="mt-2 text-dark-400">
              Identify and remediate compliance gaps across your organization
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Total Gaps</p>
            <p className="mt-1 text-3xl font-bold text-white">{GAP_DATA.length}</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Non-Compliant</p>
            <p className="mt-1 text-3xl font-bold text-red-400">{GAP_DATA.length - needsReviewCount}</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Needs Review</p>
            <p className="mt-1 text-3xl font-bold text-yellow-400">{needsReviewCount}</p>
          </div>
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Categories</p>
            <p className="mt-1 text-3xl font-bold text-copper-400">{Object.keys(categoryCounts).length}</p>
          </div>
        </div>

        {/* Generate Remediation Plans Section */}
        <div className="bg-gradient-to-br from-copper-900/20 via-copper-800/20 to-evergreen-900/20 backdrop-blur-xl border border-copper-500/30 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {hasGeneratedPlans ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    Remediation Plans Generated
                  </>
                ) : (
                  <>
                    <ShieldExclamationIcon className="h-6 w-6 text-copper-400" />
                    Generate Remediation Plans
                  </>
                )}
              </h3>
              <p className="mt-2 text-sm text-dark-300">
                {hasGeneratedPlans ? (
                  <>
                    All {GAP_DATA.length} gaps have been converted to remediation plans. View and manage them in the Remediation Plans page.
                  </>
                ) : (
                  <>
                    Automatically create {GAP_DATA.length} remediation plans from this gap analysis. Each gap will become a trackable action item with priority, due date, and assignee fields.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {hasGeneratedPlans ? (
                <>
                  <button
                    onClick={() => setShowGenerateConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-copper-500/50 text-copper-400 hover:bg-copper-500/10 transition-colors"
                  >
                    Regenerate Plans
                  </button>
                  <Link
                    href="/dashboard/privacy-officer/remediation-plans"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
                  >
                    View Plans
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setShowGenerateConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
                >
                  <ShieldExclamationIcon className="h-5 w-5" />
                  Generate Plans
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-900/30 backdrop-blur-xl border border-green-500/40 rounded-xl p-5 flex items-start gap-4">
            <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-green-300">Success!</h4>
              <p className="mt-1 text-sm text-green-200">
                {GAP_DATA.length} remediation plans have been generated and saved. You can now track and manage them in the Remediation Plans page.
              </p>
              <Link
                href="/dashboard/privacy-officer/remediation-plans"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
              >
                Go to Remediation Plans
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Category Breakdown Bar */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-dark-300 mb-3">Gaps by Domain</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as Category)}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg border transition-all duration-150 text-sm ${
                    activeCategory === cat
                      ? 'border-copper-500/50 bg-copper-500/10 text-copper-300'
                      : 'border-dark-700/50 bg-dark-900/30 text-dark-400 hover:border-dark-600 hover:text-dark-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_DOT_COLORS[cat] || 'bg-dark-400'}`} />
                  <span className="truncate flex-1">{cat}</span>
                  <span className="font-bold text-xs">{count}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Search + Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-500" />
            <input
              type="text"
              placeholder="Search gaps by keyword, category, or regulation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-copper-500/50 focus:ring-1 focus:ring-copper-500/25 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Expand/Collapse toggle */}
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-300 hover:text-white hover:border-dark-600 transition-colors"
          >
            {allExpanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4" />
                Expand All
              </>
            )}
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isAll = cat === 'All';
            const count = isAll ? GAP_DATA.length : categoryCounts[cat] || 0;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 ${
                  isActive
                    ? 'bg-copper-500/20 text-copper-300 border-copper-500/40'
                    : 'bg-dark-800/30 text-dark-400 border-dark-700/50 hover:border-dark-600 hover:text-dark-300'
                }`}
              >
                {!isAll && (
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT_COLORS[cat] || 'bg-dark-400'}`} />
                )}
                {isAll && <FunnelIcon className="h-3.5 w-3.5" />}
                {cat}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-copper-500/30 text-copper-200' : 'bg-dark-700/50 text-dark-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-400">
            Showing <span className="font-semibold text-dark-200">{filteredItems.length}</span> of{' '}
            <span className="font-semibold text-dark-200">{GAP_DATA.length}</span> gaps
            {activeCategory !== 'All' && (
              <span>
                {' '}in <span className="text-copper-400">{activeCategory}</span>
              </span>
            )}
            {searchQuery && (
              <span>
                {' '}matching &ldquo;<span className="text-copper-400">{searchQuery}</span>&rdquo;
              </span>
            )}
          </p>
        </div>

        {/* Gap Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-xl p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-dark-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-dark-300">No gaps match your filters</p>
            <p className="text-sm text-dark-500 mt-1">Try adjusting your search or category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-copper-600 hover:bg-copper-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <GapCard
                key={item.id}
                item={item}
                isExpanded={expandedIds.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-copper-900/20 backdrop-blur-xl border border-copper-500/20 rounded-2xl p-6">
          <p className="text-sm text-copper-200">
            <strong className="font-semibold">About this report:</strong> This gap analysis identifies 45 areas
            where your organization may not meet HIPAA compliance requirements. Each item links to the applicable
            federal regulation and recommended policies or tools from One Guy Consulting to help you achieve compliance.
            Items marked &ldquo;Needs Review&rdquo; require additional assessment before a determination can be made.
          </p>
        </div>
      </main>

      {/* Generate Confirmation Modal */}
      {showGenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGenerateConfirm(false)}
          />
          <div className="relative w-full max-w-lg bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 p-3 rounded-full bg-copper-500/15">
                <ShieldExclamationIcon className="h-6 w-6 text-copper-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {hasGeneratedPlans ? 'Regenerate Remediation Plans?' : 'Generate Remediation Plans?'}
                </h3>
                <p className="text-sm text-dark-400 mt-2">
                  This will generate {GAP_DATA.length} remediation plans from your gap analysis.
                  {hasGeneratedPlans && (
                    <span className="block mt-2 text-amber-400 font-medium">
                      Any existing auto-generated plans will be replaced. Manually-created plans will be preserved.
                    </span>
                  )}
                </p>
                <div className="mt-4 bg-dark-900/50 border border-dark-700 rounded-lg p-4 space-y-2 text-xs text-dark-300">
                  <p className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Each gap will become a trackable remediation plan</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Non-Compliant items will be marked as High priority</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Needs Review items will be marked as Medium priority</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>All plans will have a 90-day due date from today</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Regulation links and resources will be included in descriptions</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGenerateConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateRemediationPlans}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-copper-600 to-copper-500 text-white hover:shadow-lg hover:shadow-copper-500/20 transition-all"
              >
                {hasGeneratedPlans ? 'Regenerate Plans' : 'Generate Plans'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
