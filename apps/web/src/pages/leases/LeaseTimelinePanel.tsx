import { Badge, EmptyState, Skeleton } from '@479property/ui';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

import { useLeaseTimeline } from '../../features/lease/use-lease-support';

export function LeaseTimelinePanel({ leaseId }: { leaseId: string }) {
  const { data: entries, isLoading } = useLeaseTimeline(leaseId);

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No activity yet"
        description="Lease lifecycle events will appear here."
      />
    );
  }

  return (
    <ol className="space-y-4 border-l pl-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{entry.eventType.replace(/_/g, ' ')}</Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.createdAt), 'PPp')}
            </span>
          </div>
          {entry.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
