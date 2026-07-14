import { StatCard } from '@479property/ui';
import { Building2, DoorOpen, Home, TrendingUp } from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader';
import { useAuth } from '../features/auth/auth-context';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}`}
        description="Here's what's happening across your portfolio."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Properties" value="—" icon={Home} />
        <StatCard label="Buildings" value="—" icon={Building2} />
        <StatCard label="Units" value="—" icon={DoorOpen} />
        <StatCard label="Occupancy" value="—" icon={TrendingUp} />
      </div>
    </div>
  );
}
