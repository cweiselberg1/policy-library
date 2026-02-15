'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/privacy-officer',
    icon: HomeIcon,
  },
  {
    name: 'Security Risk Assessment',
    href: '/sra',
    icon: ShieldExclamationIcon,
  },
  {
    name: 'Policies',
    href: '/dashboard/privacy-officer/policies',
    icon: DocumentTextIcon,
    children: [
      { name: 'Policy Review', href: '/dashboard/privacy-officer/policy-bundles' },
      { name: 'Policy Publishing', href: '/dashboard/privacy-officer/compliance' },
    ],
  },
  {
    name: 'Audits',
    href: '/dashboard/privacy-officer/audits',
    icon: ClipboardDocumentCheckIcon,
    children: [
      { name: 'Physical Audit', href: '/audit/physical' },
      { name: 'IT Risk', href: '/audit' },
      { name: 'Data Device', href: '/audit/data-device' },
    ],
  },
  {
    name: 'Gaps',
    href: '/dashboard/privacy-officer/gaps',
    icon: ExclamationTriangleIcon,
  },
  {
    name: 'Remediation Plans',
    href: '/dashboard/privacy-officer/remediation-plans',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Employees',
    href: '/dashboard/privacy-officer/employees',
    icon: UserGroupIcon,
    children: [
      { name: 'Departments', href: '/dashboard/privacy-officer/departments' },
    ],
  },
  {
    name: 'Vendors',
    href: 'http://vendors.oneguyconsulting.com',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Incidents',
    href: '/dashboard/privacy-officer/incidents',
    icon: BellIcon,
    children: [
      { name: 'Report', href: '/dashboard/employee/report-incident' },
      { name: 'Review', href: '/dashboard/privacy-officer/incidents/review' },
    ],
  },
  {
    name: 'Settings',
    href: '/dashboard/privacy-officer/settings',
    icon: Cog6ToothIcon,
  },
];

export default function PrivacyOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href.startsWith('http')) return false;
    if (href === '/dashboard/privacy-officer') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const active = isActive(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.name);

        const isExternal = item.href.startsWith('http');
        const linkClassName = `group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${
          active
            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`;
        const linkContent = (
          <>
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </div>
            {hasChildren && (
              <span className="transition-transform">
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </span>
            )}
          </>
        );

        return (
          <div key={item.name}>
            {isExternal ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
                onClick={() => setMobileMenuOpen(false)}
              >
                {linkContent}
              </a>
            ) : (
              <Link
                href={item.href}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpanded(item.name);
                  }
                  setMobileMenuOpen(false);
                }}
                className={linkClassName}
              >
                {linkContent}
              </Link>
            )}

            {hasChildren && isExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-lg transition-all ${
                      pathname === child.href
                        ? 'bg-slate-700 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 px-6 py-8">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Privacy Officer</p>
                <p className="text-xs text-slate-400">Portal</p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              <NavItems />
            </ul>
          </nav>

          <div className="border-t border-slate-700 pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-slate-800 border-r border-slate-700 overflow-y-auto">
            <div className="flex flex-col gap-y-5 px-6 py-8">
              <div className="flex h-16 shrink-0 items-center">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Privacy Officer</p>
                    <p className="text-xs text-slate-400">Portal</p>
                  </div>
                </Link>
              </div>

              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-2">
                  <NavItems />
                </ul>
              </nav>

              <div className="border-t border-slate-700 pt-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        {children}
      </div>
    </div>
  );
}
