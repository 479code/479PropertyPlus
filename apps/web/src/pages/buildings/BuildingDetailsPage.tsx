import { Badge, Button, Card, CardContent, Skeleton, StatCard } from '@479property/ui';
import { ArchiveRestore, Building2, DoorOpen, Pencil, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  useArchiveBuilding,
  useBuilding,
  useBuildingSummary,
} from '../../features/inventory/use-buildings';

import { FloorsPanel } from './FloorsPanel';

export function BuildingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: building, isLoading } = useBuilding(id);
  const { data: summary } = useBuildingSummary(id);
  const archiveBuilding = useArchiveBuilding();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading || !building) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={building.name}
        description={`${building.buildingCode} · ${building.property.name}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Buildings', to: '/buildings' },
          { label: building.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/buildings/${id}/edit`)}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            {building.deletedAt ? null : (
              <Button variant="outline" onClick={() => setConfirmArchive(true)}>
                <ArchiveRestore className="mr-1.5 h-4 w-4" />
                Archive
              </Button>
            )}
          </>
        }
      />

      {building.status ? (
        <div className="mb-4">
          <Badge variant="secondary">{building.status.name}</Badge>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total units" value={building.totalUnits} icon={DoorOpen} />
        <StatCard label="Occupied" value={building.occupiedUnits} icon={Building2} />
        <StatCard label="Vacant" value={building.vacantUnits} icon={Building2} />
        <StatCard
          label="Occupancy rate"
          value={summary ? `${summary.occupancyRate}%` : '—'}
          icon={TrendingUp}
        />
      </div>

      {building.description ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{building.description}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <FloorsPanel buildingId={building.id} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={`Archive "${building.name}"?`}
        description="Archived buildings are hidden from active lists but can be restored later."
        destructive
        loading={archiveBuilding.isPending}
        onConfirm={async () => {
          try {
            await archiveBuilding.mutateAsync(building.id);
            toast.success('Building archived');
            navigate('/buildings');
          } catch {
            toast.error('Could not archive building');
          }
        }}
      />
    </div>
  );
}
