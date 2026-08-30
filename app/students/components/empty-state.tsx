import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && (
        <div className="mb-4 w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <Icon className="h-7 w-7 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white mb-2" style={{ letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      {description && (
        <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
