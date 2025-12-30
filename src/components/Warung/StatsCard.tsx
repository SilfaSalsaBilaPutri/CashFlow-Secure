import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "success";
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className="shadow-card overflow-hidden animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={`text-2xl font-bold ${
                variant === "primary"
                  ? "text-primary"
                  : variant === "success"
                  ? "text-success"
                  : "text-foreground"
              }`}
            >
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              variant === "primary"
                ? "bg-primary/10"
                : variant === "success"
                ? "bg-success/10"
                : "bg-secondary"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                variant === "primary"
                  ? "text-primary"
                  : variant === "success"
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
