import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@479property/ui';
import { ArchiveRestore, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useArchiveUnit, useUnit } from '../../features/inventory/use-units';

import { UnitDocumentsPanel } from './UnitDocumentsPanel';
import { UnitImagesPanel } from './UnitImagesPanel';
import { UnitOccupancyHistoryPanel, UnitTimelinePanel } from './UnitTimelinePanel';

function availabilityVariant(a: string): 'success' | 'secondary' | 'warning' | 'destructive' {
  if (a === 'AVAILABLE') return 'success';
  if (a === 'OCCUPIED') return 'secondary';
  if (a === 'RESERVED' || a === 'UNDER_MAINTENANCE') return 'warning';
  return 'destructive';
}

function money(value: number | null): string {
  return value != null ? `₦${value.toLocaleString()}` : '—';
}

export function UnitDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, isLoading } = useUnit(id);
  const archiveUnit = useArchiveUnit();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading || !unit) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={unit.name}
        description={`${unit.unitCode} · ${unit.unitType.name}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Units', to: '/units' },
          { label: unit.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/units/${id}/edit`)}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            {unit.deletedAt ? null : (
              <Button variant="outline" onClick={() => setConfirmArchive(true)}>
                <ArchiveRestore className="mr-1.5 h-4 w-4" />
                Archive
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={availabilityVariant(unit.availability)}>
          {unit.availability.replace(/_/g, ' ')}
        </Badge>
        <Badge variant="secondary">{unit.status.name}</Badge>
        {unit.building ? <Badge variant="outline">{unit.building.name}</Badge> : null}
        {unit.floor ? <Badge variant="outline">{unit.floor.name}</Badge> : null}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="history">Occupancy history</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Bedrooms" value={unit.bedrooms} />
                <Detail label="Bathrooms" value={unit.bathrooms} />
                <Detail label="Kitchens" value={unit.kitchens} />
                <Detail label="Parking spaces" value={unit.parkingSpaces} />
                <Detail
                  label="Size"
                  value={unit.size ? `${unit.size} ${unit.sizeUnit ?? ''}`.trim() : null}
                />
                <Detail label="Rentable" value={unit.isRentable ? 'Yes' : 'No'} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Monthly rent" value={money(unit.monthlyRent)} />
                <Detail label="Annual rent" value={money(unit.annualRent)} />
                <Detail label="Security deposit" value={money(unit.securityDeposit)} />
                <Detail label="Service charge" value={money(unit.serviceCharge)} />
                <Detail label="Expected annual revenue" value={money(unit.expectedAnnualRevenue)} />
                <Detail label="Market value" value={money(unit.marketValue)} />
              </CardContent>
            </Card>
            {unit.description ? (
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                </CardContent>
              </Card>
            ) : null}
            {unit.features.length > 0 ? (
              <Card className="lg:col-span-2">
                <CardContent className="flex flex-wrap gap-2 p-6">
                  {unit.features.map((f) => (
                    <Badge key={f.featureId} variant="outline">
                      {f.feature.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardContent className="p-6">
              <UnitImagesPanel unitId={unit.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <UnitDocumentsPanel unitId={unit.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <UnitTimelinePanel unitId={unit.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <UnitOccupancyHistoryPanel unitId={unit.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={`Archive "${unit.name}"?`}
        description="Archived units are hidden from active lists but can be restored later."
        destructive
        loading={archiveUnit.isPending}
        onConfirm={async () => {
          try {
            await archiveUnit.mutateAsync(unit.id);
            toast.success('Unit archived');
            navigate('/units');
          } catch {
            toast.error('Could not archive unit');
          }
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '—'}</p>
    </div>
  );
}
