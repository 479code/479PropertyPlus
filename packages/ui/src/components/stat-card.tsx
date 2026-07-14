import { type ComponentType, type ReactNode } from 'react';

import { cn } from '../lib/utils';

import { Card, CardContent } from './card';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {trend ? (
            <p
              className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-muted-foreground',
              )}
            >
              {trend.value}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { StatCard };
