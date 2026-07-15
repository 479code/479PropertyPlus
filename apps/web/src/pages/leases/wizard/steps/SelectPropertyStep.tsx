import { Card, CardContent, EmptyState, Skeleton } from '@479property/ui';
import { Home } from 'lucide-react';

import { usePropertiesList } from '../../../../features/property/use-properties';
import { type LeaseWizardDraft } from '../wizard-types';

export interface StepProps {
  draft: LeaseWizardDraft;
  setDraft: (patch: Partial<LeaseWizardDraft>) => void;
}

export function SelectPropertyStep({ draft, setDraft }: StepProps) {
  const properties = usePropertiesList();

  if (properties.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!properties.data || properties.data.items.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No properties yet"
        description="Create a property before starting a lease."
      />
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Select a property</h2>
      <p className="mb-4 text-sm text-muted-foreground">Which property is this lease for?</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {properties.data.items.map((p) => (
          <Card
            key={p.id}
            className={
              draft.propertyId === p.id
                ? 'cursor-pointer border-primary ring-1 ring-primary'
                : 'cursor-pointer hover:border-primary'
            }
            onClick={() =>
              setDraft({
                propertyId: p.id,
                propertyName: p.name,
                buildingId: undefined,
                buildingName: undefined,
                unitId: '',
                unitName: undefined,
              })
            }
          >
            <CardContent className="p-4">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.propertyCode}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
