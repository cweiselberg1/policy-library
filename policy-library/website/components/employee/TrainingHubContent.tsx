'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTrainingProgress, getModuleCompletions } from '@/lib/supabase/training';
import { orgStorage } from '@/lib/supabase/org-storage';

interface TrainingProgress {
  modules_completed: string[];
  current_step: string;
  percentage: number;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  order: number;
}

const modules: TrainingModule[] = [
  {
    id: 'policies',
    title: 'Policy Review',
    description: 'Review and acknowledge all required HIPAA policies',
    duration: '30 min',
    icon: BookOpenIcon,
    href: '/dashboard/employee/policies',
    order: 1,
  },
  {
    id: 'hipaa-101',
    title: 'HIPAA 101',
    description: 'Learn the fundamentals of HIPAA compliance, patient rights, and data protection',
    duration: '45 min',
    icon: ShieldCheckIcon,
    href: '/dashboard/employee/training/hipaa-101',
    order: 2,
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Awareness',
    description: 'Master essential security practices, threat recognition, and incident response',
    duration: '40 min',
    icon: AcademicCapIcon,
    href: '/dashboard/employee/training/cybersecurity',
    order: 3,
  },
];

export default function TrainingHubContent() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TrainingProgress>({
    modules_completed: [],
    current_step: 'policies',
    percentage: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadProgress = async () => {
      if (user) {
        try {
          // Fetch from Supabase
          const [trainingProgressResult, moduleCompletionsResult] = await Promise.all([
            getTrainingProgress(user.id),
            getModuleCompletions(user.id)
          ]);

          if (trainingProgressResult.data || moduleCompletionsResult.data) {
            const newProgress: TrainingProgress = {
              modules_completed: moduleCompletionsResult.data?.map(m => m.module_name) || [],
              current_step: trainingProgressResult.data?.current_step || 'policies',
              percentage: trainingProgressResult.data?.overall_percentage || 0,
            };

            setProgress(newProgress);
            // Cache to localStorage
            orgStorage.setItem('training_progress', JSON.stringify(newProgress));
            return;
          }
        } catch (error) {
          console.error('Failed to load from Supabase, falling back to localStorage:', error);
        }
      }

      // Fallback to localStorage
      const stored = orgStorage.getItem('training_progress');
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse training progress:', e);
        }
      }
    };

    loadProgress();
  }, [user]);

  const isModuleCompleted = (moduleId: string) => {
    return progress.modules_completed.includes(moduleId);
  };

  const isModuleLocked = (module: TrainingModule) => {
    if (module.order === 1) return false;
    const previousModule = modules.find((m) => m.order === module.order - 1);
    return previousModule ? !isModuleCompleted(previousModule.id) : false;
  };

  const getModuleStatus = (module: TrainingModule) => {
    if (isModuleCompleted(module.id)) {
      return { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
    if (isModuleLocked(module)) {
      return { label: 'Locked', className: 'bg-dark-700/50 text-dark-400 border border-dark-600' };
    }
    if (progress.current_step === module.id) {
      return { label: 'In Progress', className: 'bg-copper-500/10 text-copper-400 border border-copper-500/20' };
    }
    return { label: 'Available', className: 'bg-evergreen-500/10 text-evergreen-400 border border-evergreen-500/20' };
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-900 flex items-center justify-center">
        <div className="text-dark-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-evergreen-950 via-dark-900 to-evergreen-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>

              {/* Progress Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-dark-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress.percentage / 100)}`}
                      className="text-copper-600 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{progress.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const completed = isModuleCompleted(module.id);
                  const current = progress.current_step === module.id;
                  const locked = isModuleLocked(module);

                  return (
                    <div key={module.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {completed ? (
                          <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                        ) : locked ? (
                          <LockClosedIcon className="w-6 h-6 text-dark-500" />
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              current ? 'border-copper-500 bg-copper-500/20' : 'border-dark-600 bg-dark-700/50'
                            }`}
                          >
                            <span className="text-xs font-semibold text-dark-300">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium ${
                            completed ? 'text-emerald-400' : locked ? 'text-dark-500' : 'text-dark-300'
                          }`}
                        >
                          {module.title}
                        </div>
                        <div className="text-xs text-dark-500 mt-0.5">{module.duration}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Training Hub</h1>
              <p className="text-dark-400">
                Complete all training modules to ensure HIPAA compliance and protect patient data.
              </p>
            </div>

            {/* Module Cards */}
            <div className="space-y-6">
              {modules.map((module) => {
                const Icon = module.icon;
                const status = getModuleStatus(module);
                const completed = isModuleCompleted(module.id);
                const locked = isModuleLocked(module);

                return (
                  <div
                    key={module.id}
                    className={`bg-dark-800 rounded-lg border overflow-hidden transition-all ${
                      locked
                        ? 'border-dark-700 opacity-60'
                        : completed
                        ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'border-dark-700 hover:border-copper-600/50 hover:shadow-lg hover:shadow-copper-600/5'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                            completed
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : locked
                              ? 'bg-dark-700/50 border border-dark-600'
                              : 'bg-copper-500/10 border border-copper-500/20'
                          }`}
                        >
                          {completed ? (
                            <CheckCircleIcon className="w-7 h-7 text-emerald-400" />
                          ) : locked ? (
                            <LockClosedIcon className="w-7 h-7 text-dark-500" />
                          ) : (
                            <Icon className="w-7 h-7 text-copper-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.className}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-dark-400 mb-4">{module.description}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-sm text-dark-500">
                              <ClockIcon className="w-4 h-4" />
                              <span>{module.duration}</span>
                            </div>
                            {!locked && (
                              <Link
                                href={module.href}
                                className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  completed
                                    ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                    : 'bg-copper-600 text-white hover:bg-copper-700'
                                }`}
                              >
                                {completed ? 'Review' : 'Start Module'}
                                <ArrowRightIcon className="w-4 h-4" />
                              </Link>
                            )}
                            {locked && (
                              <div className="ml-auto text-sm text-dark-500">Complete previous module to unlock</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Message */}
            {progress.percentage === 100 && (
              <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-1">Training Complete!</h3>
                    <p className="text-dark-300">
                      Congratulations! You have completed all required training modules. Your certificate will be
                      generated automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
