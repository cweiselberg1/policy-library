'use client';

import Link from 'next/link';
import { CheckCircleIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  href: string;
  icon: React.ReactNode;
}

export default function ModuleCard({
  id,
  title,
  description,
  duration,
  completed,
  locked,
  href,
  icon,
}: ModuleCardProps) {
  const content = (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all ${
        locked
          ? 'border-dark-700 bg-dark-900 opacity-60'
          : completed
          ? 'border-emerald-500/30 bg-gradient-to-br from-dark-800 to-emerald-900/20 hover:border-emerald-400/50 hover:shadow-lg'
          : 'border-copper-500/30 bg-gradient-to-br from-dark-800 to-copper-900/20 hover:border-copper-400/50 hover:shadow-lg'
      } ${!locked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Background Decoration */}
      {!locked && (
        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${
          completed ? 'bg-emerald-600/10' : 'bg-copper-600/10'
        }`} />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            locked ? 'bg-dark-800' : completed ? 'bg-emerald-900/50' : 'bg-copper-900/50'
          }`}>
            {locked ? (
              <LockClosedIcon className="h-6 w-6 text-dark-500" />
            ) : (
              icon
            )}
          </div>
          {completed && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
              <CheckCircleIcon className="h-4 w-4" />
              Complete
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>

        {/* Description */}
        <p className="mt-2 text-sm text-dark-400">{description}</p>

        {/* Duration */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-dark-500">{duration}</span>
          {!locked && (
            <span className={`flex items-center gap-1 text-sm font-semibold ${
              completed ? 'text-emerald-500' : 'text-copper-500'
            }`}>
              {completed ? 'Review' : 'Start'}
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (locked) {
    return <div>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
