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
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-pearl-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-evergreen-700 to-evergreen-600">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-evergreen-700">ONE GUY CONSULTING</p>
              <p className="text-xs text-[--text-muted]">HIPAA Training Portal</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl border border-pearl-200 p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-evergreen-950 mb-2" style={{ fontFamily: 'var(--font-dm-serif)' }}>Welcome Back</h1>
              <p className="text-[--text-muted]">Sign in to continue your training</p>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[--text-muted] hover:text-evergreen-950"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-evergreen-950 border-t border-evergreen-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-evergreen-400">
            © 2026 One Guy Consulting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
