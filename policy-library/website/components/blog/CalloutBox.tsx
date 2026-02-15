import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

type CalloutType = 'info' | 'warning' | 'success';

interface CalloutBoxProps {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}

const calloutConfig = {
  info: {
    bgColor: 'bg-copper-50',
    borderColor: 'border-copper-600',
    textColor: 'text-copper-900',
    iconColor: 'text-copper-600',
    Icon: InformationCircleIcon,
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
    Icon: ExclamationTriangleIcon,
  },
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-600',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    Icon: CheckCircleIcon,
  },
};

export default function CalloutBox({ type, title, children }: CalloutBoxProps) {
  const config = calloutConfig[type];
  const Icon = config.Icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} border-l-4 p-6 rounded-r-lg my-6`}
    >
      <div className="flex gap-4">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-1`} />
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
          )}
          <div className="prose prose-dark max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
