'use client';

import Link from 'next/link';
import {
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function IncidentsPage() {
  const sections = [
    {
      title: 'Report',
      description: 'Submit a new security incident report. Available for all employees with anonymous reporting option.',
      href: '/dashboard/privacy-officer/incidents/report',
      icon: PencilSquareIcon,
      color: 'from-red-600 to-pink-600',
      features: [
        'Anonymous reporting available',
        'Multiple incident categories',
        'File attachment support',
      ],
    },
    {
      title: 'Review',
      description: 'Review, investigate, and manage all reported security incidents. Track status and assign team members.',
      href: '/dashboard/privacy-officer/incidents/review',
      icon: MagnifyingGlassIcon,
      color: 'from-copper-600 to-copper-500',
      features: [
        'Filter by status and severity',
        'Incident assignment',
        'Status tracking',
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
              Incidents
            </h1>
            <p className="mt-2 text-dark-400">Report and manage security incidents</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8 hover:border-dark-600 transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} bg-opacity-10`}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-copper-400 group-hover:translate-x-2 transition-transform">
                    <ArrowRightIcon className="h-6 w-6" />
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-copper-400 transition-colors">
                  {section.title}
                </h3>

                <p className="text-dark-400 mb-4">
                  {section.description}
                </p>

                <div className="mt-4 rounded-lg border border-dark-600/50 bg-dark-900/50 p-4">
                  <p className="text-sm font-semibold text-dark-300 mb-2">Features:</p>
                  <ul className="space-y-1">
                    {section.features.map((feature, idx) => (
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
          <h2 className="text-2xl font-bold text-white mb-4">About Incident Management</h2>
          <div className="space-y-4 text-dark-300">
            <p>
              <strong className="text-white">Report:</strong> All employees can report security incidents through a secure form.
              Anonymous reporting is available to encourage reporting without fear of retaliation.
            </p>
            <p>
              <strong className="text-white">Review:</strong> Privacy Officers can review all reported incidents,
              assign team members, track investigation status, and document resolution steps.
            </p>
            <div className="mt-6 bg-red-900/20 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-200">
                <strong className="font-semibold">Important:</strong> All security incidents must be reported promptly.
                Timely reporting is essential for minimizing impact and maintaining HIPAA compliance.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
