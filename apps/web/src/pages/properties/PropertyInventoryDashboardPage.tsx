import { Card, CardContent, Skeleton, StatCard } from '@479property/ui';
import { Building2, DoorOpen, Home, Layers, TrendingUp, Wallet } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader';
import { usePropertyInventorySummary } from '../../features/inventory/use-inventory-summary';

function money(value: number): string {
  return `₦${value.toLocaleString()}`;
}

export function PropertyInventoryDashboardPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { data: summary, isLoading } = usePropertyInventorySummary(propertyId);

  return (
    <div>
      <PageHeader
        title="Property Inventory Dashboard"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Properties', to: '/properties' },
          { label: 'Inventory' },
        ]}
      />

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Buildings" value={summary.totalBuildings} icon={Building2} />
            <StatCard label="Floors" value={summary.totalFloors} icon={Layers} />
            <StatCard label="Units" value={summary.totalUnits} icon={DoorOpen} />
            <StatCard
              label="Expected annual revenue"
              value={money(summary.expectedRevenue)}
              icon={Wallet}
            />
          </div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Available" value={summary.availableUnits} icon={Home} />
            <StatCard label="Occupied" value={summary.occupiedUnits} icon={Building2} />
            <StatCard label="Reserved" value={summary.reservedUnits} icon={DoorOpen} />
            <StatCard label="Under maintenance" value={summary.maintenanceUnits} icon={DoorOpen} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy rate</p>
                  <p className="text-2xl font-semibold">{summary.occupancyPercentage}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <DoorOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vacancy rate</p>
                  <p className="text-2xl font-semibold">{summary.vacancyPercentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.vacantUnits} vacant units
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
