'use client';

import Link from 'next/link';
import {
  BookOpenIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function PoliciesPage() {
  const sections = [
    {
      title: 'Policy Review',
      description: 'Review and manage policy bundles, assign policies to employees, and track acknowledgments.',
      href: '/dashboard/privacy-officer/policy-bundles',
      icon: BookOpenIcon,
      color: 'from-copper-600 to-copper-500',
      stats: 'Manage policy assignments',
    },
    {
      title: 'Policy Publishing',
      description: 'Monitor compliance status, track policy attestations, and view organization-wide compliance metrics.',
      href: '/dashboard/privacy-officer/compliance',
      icon: DocumentCheckIcon,
      color: 'from-emerald-600 to-teal-600',
      stats: 'Track compliance status',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-dark-800/50 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-copper-400 via-copper-300 to-evergreen-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-dm-serif)' }}>
              Policies
            </h1>
            <p className="mt-2 text-dark-400">Manage policy review, publishing, and compliance tracking</p>
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
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} bg-opacity-10 mb-4`}>
                  <section.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-copper-400 transition-colors">
                  {section.title}
                </h3>

                <p className="text-dark-400 mb-4">
                  {section.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-dark-500">
                    {section.stats}
                  </span>
                  <span className="text-copper-400 group-hover:translate-x-2 transition-transform">
                    <ArrowRightIcon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Info */}
        <div className="mt-12 bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">About Policy Management</h2>
          <div className="space-y-4 text-dark-300">
            <p>
              <strong className="text-white">Policy Review:</strong> Create policy bundles, assign them to departments or individual employees, and track acknowledgment progress.
            </p>
            <p>
              <strong className="text-white">Policy Publishing:</strong> Monitor organization-wide compliance, view attestation status, and ensure all employees have completed required policy reviews.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
