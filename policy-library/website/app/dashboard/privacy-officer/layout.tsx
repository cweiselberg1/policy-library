'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { getSession, getUserProfile } from '@/lib/supabase/auth';
import { loadOrgData } from '@/lib/supabase/org-storage';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
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
  ArrowRightStartOnRectangleIcon,
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
    href: '/dashboard/privacy-officer/vendors',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Incidents',
    href: '/dashboard/privacy-officer/incidents',
    icon: BellIcon,
    children: [
      { name: 'Report', href: '/dashboard/privacy-officer/incidents/report' },
      { name: 'Review', href: '/dashboard/privacy-officer/incidents/review' },
    ],
  },
  {
    name: 'Settings',
    href: '/dashboard/privacy-officer/settings',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Sign Out',
    href: '/logout',
    icon: ArrowRightStartOnRectangleIcon,
  },
];

export default function PrivacyOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: sessionData } = await getSession();

      if (!sessionData?.session?.user) {
        router.replace('/login');
        return;
      }

      // Get user profile to check role
      const { data: profile } = await getUserProfile(sessionData.session.user.id);

      if (!profile) {
        // No profile yet - send to onboarding, not back to login
        router.replace('/onboarding');
        return;
      }

      // Check if user has admin-level role
      const role = profile.role;
      if (role === 'employee' || role === 'department_manager') {
        // Redirect employees to employee dashboard
        router.replace('/dashboard/employee');
        return;
      }

      // Hydrate org cache before rendering children that read orgStorage
      if (profile.organization_id) {
        await loadOrgData(profile.organization_id);
      }

      // Allow access for admin, privacy_officer, compliance_manager
      setAuthChecked(true);
    }
    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-copper-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-dark-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
            ? 'bg-copper-600 text-white shadow-lg shadow-copper-600/20'
            : 'text-dark-300 hover:bg-evergreen-800/50 hover:text-white'
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
                        ? 'bg-evergreen-800 text-copper-400'
                        : 'text-dark-400 hover:bg-evergreen-800/50 hover:text-pearl-200'
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
    <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-950">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-evergreen-900 text-dark-300 hover:text-white border border-evergreen-800"
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
        <div className="flex grow flex-col bg-evergreen-900/80 backdrop-blur-xl border-r border-evergreen-800/50">
          <div className="px-6 pt-8 pb-2 shrink-0">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-evergreen-700 to-evergreen-600">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Privacy Officer</p>
                  <p className="text-xs text-dark-400">Portal</p>
                </div>
              </Link>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-2">
            <ul className="flex flex-col gap-y-2">
              <NavItems />
            </ul>
          </nav>

          <div className="shrink-0 border-t border-evergreen-800 px-6 py-3 space-y-1">
            <Link
              href="/logout"
              className="block px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Sign Out
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-xs text-dark-500 hover:text-dark-300 transition-colors"
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
            className="fixed inset-0 bg-evergreen-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-evergreen-900 border-r border-evergreen-800 flex flex-col">
            <div className="px-6 pt-8 pb-2 shrink-0">
              <div className="flex h-16 shrink-0 items-center">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-evergreen-700 to-evergreen-600">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Privacy Officer</p>
                    <p className="text-xs text-dark-400">Portal</p>
                  </div>
                </Link>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-2">
              <ul className="flex flex-col gap-y-2">
                <NavItems />
              </ul>
            </nav>

            <div className="shrink-0 border-t border-evergreen-800 px-6 py-4 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-dark-400 hover:text-pearl-200 transition-colors"
              >
                ← Back to Home
              </Link>
              <Link
                href="/logout"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-dark-400 hover:text-red-400 transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                Sign Out
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        <AuthProvider>{children}</AuthProvider>
      </div>
    </div>
  );
}
