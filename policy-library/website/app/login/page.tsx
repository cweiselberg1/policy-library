import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | HIPAA Training Portal',
  description: 'Sign in to access your HIPAA compliance training',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-600">ONE GUY CONSULTING</p>
              <p className="text-xs text-slate-600">HIPAA Training Portal</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-600">Sign in to continue your training</p>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-600">
            © 2026 One Guy Consulting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
