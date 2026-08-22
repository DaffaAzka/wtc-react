import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarWithLabelProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Progress bar with optional label and percentage display
 */
export function ProgressBarWithLabel({
  value,
  label,
  showPercentage = true,
  className,
  size = "md",
}: ProgressBarWithLabelProps) {
  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3",
  }[size];

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground font-medium">{label}</span>}
          {showPercentage && <span className="font-bold text-primary">{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} className={heightClass} />
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

/**
 * Circular progress indicator
 */
export function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  className,
  showPercentage = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
}

interface CompletionBadgeProps {
  completed: number;
  total: number;
  label?: string;
  className?: string;
}

/**
 * Badge showing completion count (e.g., "5 of 10 lessons")
 */
export function CompletionBadge({ completed, total, label = "items", className }: CompletionBadgeProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        isComplete ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      <span>
        {completed} of {total} {label}
      </span>
    </div>
  );
}

interface LessonStatusIconProps {
  state: "locked" | "current" | "completed";
  size?: number;
  className?: string;
}

/**
 * Icon indicating lesson status
 */
export function LessonStatusIcon({ state, size = 20, className }: LessonStatusIconProps) {
  const iconProps = {
    size,
    className: cn(className),
  };

  switch (state) {
    case "completed":
      return <CheckCircle2 {...iconProps} className={cn(iconProps.className, "text-green-500")} />;
    case "current":
      return <Circle {...iconProps} className={cn(iconProps.className, "text-blue-500")} />;
    case "locked":
      return <Lock {...iconProps} className={cn(iconProps.className, "text-muted-foreground")} />;
  }
}

interface ModuleProgressCardProps {
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Card showing module progress with circular indicator
 */
export function ModuleProgressCard({
  title,
  progress,
  completedLessons,
  totalLessons,
  className,
  onClick,
}: ModuleProgressCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CircularProgress value={progress} size={56} strokeWidth={5} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">
          {completedLessons} of {totalLessons} lessons
        </p>
      </div>
    </div>
  );
}

interface TrackProgressHeaderProps {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  className?: string;
}

/**
 * Header section showing overall track progress
 */
export function TrackProgressHeader({
  progress,
  completedLessons,
  totalLessons,
  className,
}: TrackProgressHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Your Progress</h3>
        <CompletionBadge completed={completedLessons} total={totalLessons} label="lessons" />
      </div>
      <ProgressBarWithLabel value={progress} showPercentage size="lg" />
    </div>
  );
}
