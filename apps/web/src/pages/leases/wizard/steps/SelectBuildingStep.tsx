import { Button, Card, CardContent, EmptyState, Skeleton } from '@479property/ui';
import { Building2 } from 'lucide-react';

import { useBuildings } from '../../../../features/inventory/use-buildings';

import { type StepProps } from './SelectPropertyStep';

export function SelectBuildingStep({ draft, setDraft }: StepProps) {
  const buildings = useBuildings({ propertyId: draft.propertyId, pageSize: 100 });

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Select a building</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Optional — skip if this property has no distinct buildings.
      </p>

      <Button
        type="button"
        variant={!draft.buildingId ? 'default' : 'outline'}
        size="sm"
        className="mb-4"
        onClick={() =>
          setDraft({
            buildingId: undefined,
            buildingName: undefined,
            unitId: '',
            unitName: undefined,
          })
        }
      >
        No building / skip
      </Button>

      {buildings.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !buildings.data || buildings.data.items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No buildings on this property"
          description="You can skip this step."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.data.items.map((b) => (
            <Card
              key={b.id}
              className={
                draft.buildingId === b.id
                  ? 'cursor-pointer border-primary ring-1 ring-primary'
                  : 'cursor-pointer hover:border-primary'
              }
              onClick={() =>
                setDraft({
                  buildingId: b.id,
                  buildingName: b.name,
                  unitId: '',
                  unitName: undefined,
                })
              }
            >
              <CardContent className="p-4">
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-muted-foreground">{b.buildingCode}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
