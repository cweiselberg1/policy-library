'use client';

import Link from 'next/link';
import {
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function AuditsPage() {
  const audits = [
    {
      title: 'Physical Audit',
      description: 'Interactive audit tool to assess compliance with HIPAA \u00a7164.310 Physical Safeguards requirements.',
      href: '/audit/physical',
      icon: ClipboardDocumentCheckIcon,
      color: 'from-copper-600 to-copper-500',
      features: [
        'Facility Access Controls',
        'Workstation Use & Security',
        'Device & Media Controls',
      ],
    },
    {
      title: 'IT Risk Assessment',
      description: 'Comprehensive security risk assessment covering technical controls, network security, and incident response.',
      href: '/audit',
      icon: ShieldExclamationIcon,
      color: 'from-orange-600 to-red-600',
      features: [
        'Risk scoring (Likelihood \u00d7 Impact)',
        'Heat map visualization',
        'Prioritized remediation plan',
      ],
    },
    {
      title: 'Data Device Audit',
      description: 'Track and assess security controls for all devices accessing ePHI with compliance scoring.',
      href: '/audit/data-device',
      icon: ComputerDesktopIcon,
      color: 'from-copper-600 to-copper-500',
      features: [
        'Device inventory tracking',
        'Security control assessment',
        'Compliance scoring',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Audits
            </h1>
            <p className="mt-2 text-dark-400">Comprehensive HIPAA compliance audit tools and assessments</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Audit Cards */}
        <div className="grid grid-cols-1 gap-8">
          {audits.map((audit) => (
            <Link
              key={audit.href}
              href={audit.href}
              className="group relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8 hover:border-dark-600 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${audit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${audit.color} bg-opacity-10 mb-4`}>
                    <audit.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-copper-400 group-hover:translate-x-2 transition-transform">
                    <ArrowRightIcon className="h-6 w-6" />
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-copper-400 transition-colors">
                  {audit.title}
                </h3>

                <p className="text-dark-400 mb-4">
                  {audit.description}
                </p>

                <div className="mt-4 rounded-lg border border-dark-600/50 bg-dark-900/50 p-4">
                  <p className="text-sm font-semibold text-dark-300 mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {audit.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-dark-400">
                        <CheckCircleIcon className="h-4 w-4 text-copper-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About HIPAA Audits</h2>
          <div className="space-y-4 text-dark-300">
            <p>
              These audit tools help you assess and document your organization's compliance with HIPAA requirements. Each audit provides:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Interactive assessment questionnaires</li>
              <li>Automated scoring and compliance reporting</li>
              <li>Export capabilities for documentation</li>
              <li>Gap identification and remediation guidance</li>
            </ul>
            <p className="text-sm text-dark-400 mt-6">
              Regular audits are essential for maintaining HIPAA compliance and identifying areas for improvement in your security posture.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
