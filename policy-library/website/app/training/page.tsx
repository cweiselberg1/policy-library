'use client';

import { useEffect, useState } from 'react';
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
  const [progress, setProgress] = useState<TrainingProgress>({
    policies_completed: [],
    modules_completed: [],
    current_step: 'policies',
    percentage: 0,
  });

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem('hipaa-training-progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProgress(data);
      } catch (err) {
        console.error('Failed to parse training progress:', err);
      }
    }
  }, []);

  const modules = [
    {
      id: 'policies',
      title: 'Policy Review',
      description: 'Review and acknowledge all required HIPAA policies for your organization.',
      duration: '30 min',
      completed: progress.modules_completed.includes('policies'),
      locked: false,
      href: '/training/policies',
      icon: <BookOpenIcon className="h-6 w-6 text-evergreen-700" />,
    },
    {
      id: 'hipaa-101',
      title: 'HIPAA 101',
      description: 'Learn the fundamentals of HIPAA compliance, patient rights, and data protection.',
      duration: '45 min',
      completed: progress.modules_completed.includes('hipaa-101'),
      locked: !progress.modules_completed.includes('policies'),
      href: '/training/hipaa-101',
      icon: <ShieldCheckIcon className="h-6 w-6 text-copper-600" />,
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Awareness',
      description: 'Master essential security practices, threat recognition, and incident response.',
      duration: '40 min',
      completed: progress.modules_completed.includes('cybersecurity'),
      locked: !progress.modules_completed.includes('hipaa-101'),
      href: '/training/cybersecurity',
      icon: <AcademicCapIcon className="h-6 w-6 text-evergreen-600" />,
    },
  ];

  const steps = modules.map((module) => ({
    id: module.id,
    title: module.title,
    completed: module.completed,
  }));

  const currentStep = modules.findIndex((m) => !m.completed) + 1 || modules.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-50 via-evergreen-50/30 to-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-pearl-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-evergreen-950" style={{ fontFamily: 'var(--font-dm-serif)' }}>HIPAA Training Portal</h1>
              <p className="mt-1 text-[--text-muted]">Complete your compliance training</p>
            </div>
            <Link
              href="/"
              className="text-sm text-copper-600 hover:text-copper-700 font-medium"
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
            <h2 className="text-2xl font-bold text-evergreen-950 mb-6">Training Modules</h2>

            <div className="space-y-6">
              {modules.map((module) => (
                <ModuleCard key={module.id} {...module} />
              ))}
            </div>

            {/* Certificate Section */}
            {progress.percentage === 100 && (
              <div className="mt-8 bg-gradient-to-br from-evergreen-50 to-copper-50 rounded-xl border-2 border-evergreen-200 p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-evergreen-100 mb-4">
                  <ShieldCheckIcon className="h-10 w-10 text-evergreen-600" />
                </div>
                <h3 className="text-2xl font-bold text-evergreen-950 mb-2">
                  Congratulations!
                </h3>
                <p className="text-[--text-muted] mb-6">
                  You've completed all required HIPAA training modules.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-copper-600 to-copper-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Download Certificate
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <ProgressTracker
              currentStep={currentStep}
              totalSteps={modules.length}
              percentage={progress.percentage}
              steps={steps}
            />

            {/* Help Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-pearl-200 p-6">
              <h3 className="text-lg font-semibold text-evergreen-950 mb-2">Need Help?</h3>
              <p className="text-sm text-[--text-muted] mb-4">
                If you have questions about the training or need assistance, contact your compliance officer.
              </p>
              <a
                href="mailto:compliance@example.com"
                className="text-sm text-copper-600 hover:text-copper-700 font-medium"
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
