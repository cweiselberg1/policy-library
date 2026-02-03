import Link from "next/link";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <PageViewTracker pageName="Home" />
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          {/* One Guy Consulting Badge */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-blue-600">ONE GUY CONSULTING</p>
              <p className="text-xs text-slate-600">Healthcare Compliance Experts</p>
            </div>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            HIPAA Policy Library
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
            Production-ready HIPAA compliance policies for Covered Entities and Business Associates.
            Comprehensive, customizable, and ready to deploy.
          </p>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/blog"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Blog
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/training"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Training
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/audit/physical"
              className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
            >
              Audit Tools
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <Link
              href="#policies"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105"
            >
              Browse Policies
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#features"
              className="flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              Learn More
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-blue-600">62</p>
              <p className="mt-1 text-sm text-slate-600">Total Policies</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">100%</p>
              <p className="mt-1 text-sm text-slate-600">HIPAA Coverage</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-cyan-600">59/59</p>
              <p className="mt-1 text-sm text-slate-600">Requirements Met</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-violet-600">2026</p>
              <p className="mt-1 text-sm text-slate-600">Ready</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        {/* Policy Collections Section */}
        <section id="policies" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Choose Your Policy Collection
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Tailored policy sets based on your HIPAA compliance requirements
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* Covered Entities Card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-xl shadow-blue-600/10 transition-all hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-600/20">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-blue-600/10 to-cyan-600/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                    39 Policies
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900">
                  Covered Entities
                </h3>

                <p className="mt-3 text-base text-slate-700">
                  Complete compliance coverage for healthcare providers, health plans, and healthcare clearinghouses.
                </p>

                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <p className="text-sm font-semibold text-blue-900">Includes:</p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      HIPAA Security Rule (all requirements)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      HIPAA Privacy Rule (complete)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      Breach Notification Rule
                    </li>
                  </ul>
                </div>

                <div className="mt-6 space-y-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">Key Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Access Control</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Workforce Training</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Patient Rights</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Risk Management</span>
                  </div>
                </div>

                <Link
                  href="/covered-entities"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.02]"
                >
                  Browse CE Policies
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Business Associates Card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/50 p-8 shadow-xl shadow-cyan-600/10 transition-all hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-600/20">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-600/10 to-teal-600/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 shadow-lg">
                    <ShieldCheckIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="rounded-full bg-cyan-600 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                    23 Policies
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900">
                  Business Associates
                </h3>

                <p className="mt-3 text-base text-slate-700">
                  Focused compliance policies for vendors, contractors, and service providers handling PHI.
                </p>

                <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50/50 p-4">
                  <p className="text-sm font-semibold text-cyan-900">Includes:</p>
                  <ul className="mt-2 space-y-1 text-sm text-cyan-800">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-cyan-600" />
                      HIPAA Security Rule (all requirements)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-cyan-600" />
                      Breach Notification Rule
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-cyan-600" />
                      BAA-specific requirements
                    </li>
                  </ul>
                </div>

                <div className="mt-6 space-y-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">Key Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Data Security</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Incident Response</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Access Controls</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">Vendor Management</span>
                  </div>
                </div>

                <Link
                  href="/business-associates"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-600/25 transition-all hover:shadow-xl hover:shadow-cyan-600/40 hover:scale-[1.02]"
                >
                  Browse BA Policies
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mt-32 scroll-mt-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Professional-grade policy management built for compliance teams
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Searchable Library
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Quickly find specific policies with powerful search and category filtering
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
                <PencilSquareIcon className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Customizable Templates
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                YAML metadata makes it easy to adapt policies to your organization
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <BookOpenIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Implementation Guides
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Each policy includes clear procedures and responsibilities
              </p>
            </div>

            <Link
              href="/audit/physical"
              className="group rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/50 p-6 shadow-sm transition-all hover:border-cyan-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 transition-colors group-hover:bg-cyan-200">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Physical Safeguards Audit
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Interactive audit tool to assess compliance with HIPAA §164.310 requirements
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-cyan-600">
                Start Audit
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          {/* Additional Audit Tools */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <Link
              href="/audit/it-risk"
              className="group rounded-xl border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50/50 p-8 shadow-sm transition-all hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100 transition-colors group-hover:bg-orange-200">
                  <ShieldExclamationIcon className="h-8 w-8 text-orange-600" />
                </div>
                <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  NEW
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">
                IT Risk Assessment
              </h3>
              <p className="mt-3 text-base text-slate-700">
                Comprehensive security risk assessment covering technical controls, network security, application security, data protection, and incident response
              </p>
              <div className="mt-4 rounded-lg border border-orange-200 bg-white p-4">
                <p className="text-sm font-semibold text-orange-900">Includes:</p>
                <ul className="mt-2 space-y-1 text-sm text-orange-800">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-orange-600" />
                    Risk scoring (Likelihood × Impact)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-orange-600" />
                    Heat map visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-orange-600" />
                    Prioritized remediation plan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-orange-600" />
                    Risk register export (MD/CSV)
                  </li>
                </ul>
              </div>
              <div className="mt-6 flex items-center gap-1 text-base font-semibold text-orange-600">
                Start Risk Assessment
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
                <ChartBarIcon className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">
                More Tools Coming Soon
              </h3>
              <p className="mt-3 text-base text-slate-700">
                We're building additional compliance assessment and risk management tools
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>• Technical Safeguards Audit</p>
                <p>• Administrative Safeguards Review</p>
                <p>• Business Associate Assessment</p>
                <p>• Security Incident Response Drills</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Stats Section */}
        <section className="mt-32">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-600/20" />
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-10 w-10 text-blue-400" />
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Complete HIPAA Coverage
                </h2>
              </div>

              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                <div>
                  <p className="text-5xl font-bold text-white">100%</p>
                  <p className="mt-2 text-lg text-blue-200">Security Rule Coverage</p>
                  <p className="mt-1 text-sm text-slate-400">
                    All administrative, physical, and technical safeguards
                  </p>
                </div>

                <div>
                  <p className="text-5xl font-bold text-white">59/59</p>
                  <p className="mt-2 text-lg text-blue-200">Requirements Met</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Every HIPAA Security Rule requirement covered
                  </p>
                </div>

                <div>
                  <p className="text-5xl font-bold text-white">2026</p>
                  <p className="mt-2 text-lg text-blue-200">Compliance Ready</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Updated for current regulations and best practices
                  </p>
                </div>
              </div>

              <div className="mt-12 rounded-xl border border-blue-400/30 bg-blue-950/50 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold text-blue-300">FORMAT</p>
                <p className="mt-2 text-base text-slate-300">
                  All policies delivered in <span className="font-mono font-semibold text-blue-400">Markdown</span> format with <span className="font-mono font-semibold text-blue-400">YAML</span> metadata for easy integration, version control, and customization.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">One Guy Consulting</p>
                <p className="text-xs text-slate-600">Healthcare Compliance Solutions</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              © 2026 One Guy Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
