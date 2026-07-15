import { Card, CardContent, EmptyState, Skeleton, StatCard } from '@479property/ui';
import { Building2, DoorOpen, Home, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader';
import { useLeaseDashboard } from '../../features/lease/use-lease-support';
import { usePropertiesList } from '../../features/property/use-properties';

export function OccupancyDashboardPage() {
  const { data: summary, isLoading } = useLeaseDashboard();
  const properties = usePropertiesList();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Occupancy Dashboard"
        description="Portfolio-wide occupancy, with a per-property breakdown."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Occupancy Dashboard' }]}
      />

      {isLoading || !summary ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Portfolio occupancy rate"
            value={`${summary.occupancyRate}%`}
            icon={TrendingUp}
          />
          <StatCard label="Active leases" value={summary.activeLeases} icon={DoorOpen} />
          <StatCard label="Expiring in 30 days" value={summary.expiringIn30Days} icon={Building2} />
          <StatCard label="Upcoming move-ins" value={summary.upcomingMoveIns} icon={Home} />
        </div>
      )}

      <h2 className="mb-3 text-base font-semibold">By property</h2>
      {properties.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !properties.data || properties.data.items.length === 0 ? (
        <EmptyState icon={Home} title="No properties yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.data.items.map((p) => {
            const rate = p.totalUnits > 0 ? Math.round((p.occupiedUnits / p.totalUnits) * 100) : 0;
            return (
              <Card
                key={p.id}
                className="cursor-pointer transition-colors hover:border-primary"
                onClick={() => navigate(`/properties/${p.id}/inventory`)}
              >
                <CardContent className="p-6">
                  <p className="font-medium">{p.name}</p>
                  <p className="mb-3 text-sm text-muted-foreground">{p.propertyCode}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {p.occupiedUnits}/{p.totalUnits} units occupied
                    </span>
                    <span className="font-semibold">{rate}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
