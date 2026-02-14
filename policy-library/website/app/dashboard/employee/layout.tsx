'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import {
  HomeIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/employee',
    icon: HomeIcon,
  },
  {
    name: 'My Policies',
    href: '/dashboard/employee/policies',
    icon: DocumentTextIcon,
  },
  {
    name: 'Training',
    href: '/dashboard/employee/training',
    icon: AcademicCapIcon,
  },
  {
    name: 'Report Incident',
    href: '/dashboard/employee/report-incident',
    icon: ShieldExclamationIcon,
  },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard/employee') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const active = isActive(item.href);

        return (
          <div key={item.name}>
            <Link
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Employee Portal</p>
                <p className="text-xs text-slate-400">HIPAA Compliance</p>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Employee Portal</p>
                    <p className="text-xs text-slate-400">HIPAA Compliance</p>
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
        <AuthProvider>{children}</AuthProvider>
      </div>
    </div>
  );
}
