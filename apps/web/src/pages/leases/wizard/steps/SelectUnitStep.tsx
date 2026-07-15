import { Badge, Card, CardContent, EmptyState, Skeleton } from '@479property/ui';
import { DoorOpen } from 'lucide-react';

import { useUnits } from '../../../../features/inventory/use-units';

import { type StepProps } from './SelectPropertyStep';

function availabilityVariant(a: string): 'success' | 'secondary' | 'warning' | 'destructive' {
  if (a === 'AVAILABLE') return 'success';
  if (a === 'OCCUPIED') return 'secondary';
  if (a === 'RESERVED' || a === 'UNDER_MAINTENANCE') return 'warning';
  return 'destructive';
}

export function SelectUnitStep({ draft, setDraft }: StepProps) {
  const units = useUnits({
    propertyId: draft.propertyId,
    buildingId: draft.buildingId,
    pageSize: 100,
  });

  if (units.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!units.data || units.data.items.length === 0) {
    return (
      <EmptyState
        icon={DoorOpen}
        title="No units found"
        description="No units exist for this property/building yet."
      />
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Select a unit</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Units already reserved by another lease can still be picked in Draft — the system will check
        for conflicts when you submit for approval.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {units.data.items.map((u) => (
          <Card
            key={u.id}
            className={
              draft.unitId === u.id
                ? 'cursor-pointer border-primary ring-1 ring-primary'
                : 'cursor-pointer hover:border-primary'
            }
            onClick={() => setDraft({ unitId: u.id, unitName: u.name })}
          >
            <CardContent className="p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium">{u.name}</p>
                <Badge variant={availabilityVariant(u.availability)}>
                  {u.availability.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{u.unitCode}</p>
              {u.monthlyRent ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  ₦{u.monthlyRent.toLocaleString()}/mo
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
