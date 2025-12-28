import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      <div className="text-8xl mb-6">
        {typeof icon === 'string' ? icon : icon}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3 max-w-md">
        {title}
      </h2>

      <p className="text-gray-600 mb-8 max-w-lg leading-relaxed">
        {description}
      </p>

      <div className="flex justify-center">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-primary-400 text-white rounded-lg hover:bg-primary-500 transition-all hover:scale-105 font-medium"
          >
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-6 py-3 text-gray-700 hover:text-primary-400 transition-colors font-medium"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
