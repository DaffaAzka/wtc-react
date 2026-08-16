import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description,
  action 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {Icon && (
          <div className="mb-4 rounded-full bg-muted p-4">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}