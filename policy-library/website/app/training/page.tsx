'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpenIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import ProgressTracker from '@/components/training/ProgressTracker';
import ModuleCard from '@/components/training/ModuleCard';

interface TrainingProgress {
  policies_completed: string[];
  modules_completed: string[];
  current_step: string;
  percentage: number;
}

export default function TrainingDashboard() {
  const router = useRouter();
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/training/progress');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 'policies',
      title: 'Policy Review',
      description: 'Review and acknowledge all required HIPAA policies for your organization.',
      duration: '30 min',
      completed: progress?.modules_completed.includes('policies') || false,
      locked: false,
      href: '/training/policies',
      icon: <BookOpenIcon className="h-6 w-6 text-blue-600" />,
    },
    {
      id: 'hipaa-101',
      title: 'HIPAA 101',
      description: 'Learn the fundamentals of HIPAA compliance, patient rights, and data protection.',
      duration: '45 min',
      completed: progress?.modules_completed.includes('hipaa-101') || false,
      locked: !progress?.modules_completed.includes('policies'),
      href: '/training/hipaa-101',
      icon: <ShieldCheckIcon className="h-6 w-6 text-cyan-600" />,
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Awareness',
      description: 'Master essential security practices, threat recognition, and incident response.',
      duration: '40 min',
      completed: progress?.modules_completed.includes('cybersecurity') || false,
      locked: !progress?.modules_completed.includes('hipaa-101'),
      href: '/training/cybersecurity',
      icon: <AcademicCapIcon className="h-6 w-6 text-emerald-600" />,
    },
  ];

  const steps = modules.map((module) => ({
    id: module.id,
    title: module.title,
    completed: module.completed,
  }));

  const currentStep = modules.findIndex((m) => !m.completed) + 1 || modules.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your training...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProgress}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">HIPAA Training Portal</h1>
              <p className="mt-1 text-slate-600">Complete your compliance training</p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Training Modules</h2>

            <div className="space-y-6">
              {modules.map((module) => (
                <ModuleCard key={module.id} {...module} />
              ))}
            </div>

            {/* Certificate Section */}
            {progress && progress.percentage === 100 && (
              <div className="mt-8 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-200 p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <ShieldCheckIcon className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Congratulations!
                </h3>
                <p className="text-slate-600 mb-6">
                  You've completed all required HIPAA training modules.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Download Certificate
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {progress && (
              <ProgressTracker
                currentStep={currentStep}
                totalSteps={modules.length}
                percentage={progress.percentage}
                steps={steps}
              />
            )}

            {/* Help Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">
                If you have questions about the training or need assistance, contact your compliance officer.
              </p>
              <a
                href="mailto:compliance@example.com"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
