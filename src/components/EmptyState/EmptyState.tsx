import type { EmptyStateProps } from './EmptyState.helper';

export const EmptyState = ({ icon = '📭', title, message, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4" role="img" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      {action}
    </div>
  );
};
