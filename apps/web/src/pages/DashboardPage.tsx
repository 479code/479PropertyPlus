import { Skeleton, StatCard } from '@479property/ui';
import { Building2, DoorOpen, Home, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader } from '../components/layout/PageHeader';
import { useAuth } from '../features/auth/auth-context';
import { usePropertiesList } from '../features/property/use-properties';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = usePropertiesList();

  const totals = useMemo(() => {
    const items = data?.items ?? [];
    const totalProperties = items.length;
    const totalBuildings = items.reduce((sum, p) => sum + p.totalBuildings, 0);
    const totalUnits = items.reduce((sum, p) => sum + p.totalUnits, 0);
    const occupiedUnits = items.reduce((sum, p) => sum + p.occupiedUnits, 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0;
    return { totalProperties, totalBuildings, totalUnits, occupancyRate };
  }, [data]);

  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}`}
        description="Here's what's happening across your portfolio."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : (
          <>
            <StatCard label="Properties" value={totals.totalProperties} icon={Home} />
            <StatCard label="Buildings" value={totals.totalBuildings} icon={Building2} />
            <StatCard label="Units" value={totals.totalUnits} icon={DoorOpen} />
            <StatCard label="Occupancy" value={`${totals.occupancyRate}%`} icon={TrendingUp} />
          </>
        )}
      </div>
    </div>
  );
}
