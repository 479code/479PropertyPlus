import { Skeleton, StatCard } from '@479property/ui';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DoorOpen,
  FileText,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldX,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { PageHeader } from '../../components/layout/PageHeader';
import { useLeaseDashboard } from '../../features/lease/use-lease-support';

function money(v: number): string {
  return `₦${v.toLocaleString()}`;
}

export function LeaseDashboardPage() {
  const { data: summary, isLoading } = useLeaseDashboard();

  return (
    <div>
      <PageHeader
        title="Lease Dashboard"
        description="A portfolio-wide view of lease activity and occupancy."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Lease Dashboard' }]}
      />

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total leases" value={summary.totalLeases} icon={FileText} />
          <StatCard label="Active leases" value={summary.activeLeases} icon={CheckCircle} />
          <StatCard label="Pending approval" value={summary.pendingApproval} icon={Clock} />
          <StatCard label="Awaiting signature" value={summary.awaitingSignature} icon={Clock} />
          <StatCard
            label="Expiring in 30 days"
            value={summary.expiringIn30Days}
            icon={AlertCircle}
          />
          <StatCard label="Expired" value={summary.expired} icon={Calendar} />
          <StatCard label="Terminated" value={summary.terminated} icon={ShieldX} />
          <StatCard
            label="Avg. lease duration"
            value={
              summary.averageLeaseDurationMonths ? `${summary.averageLeaseDurationMonths} mo` : '—'
            }
            icon={Clock}
          />
          <StatCard label="Occupancy rate" value={`${summary.occupancyRate}%`} icon={DoorOpen} />
          <StatCard
            label="Monthly rental value"
            value={money(summary.monthlyRentalValue)}
            icon={Wallet}
          />
          <StatCard
            label="Annual contract value"
            value={money(summary.annualContractValue)}
            icon={TrendingUp}
          />
          <StatCard label="Upcoming renewals" value={summary.upcomingRenewals} icon={RefreshCw} />
          <StatCard label="Upcoming move-ins" value={summary.upcomingMoveIns} icon={LogIn} />
          <StatCard label="Upcoming move-outs" value={summary.upcomingMoveOuts} icon={LogOut} />
        </div>
      )}
    </div>
  );
}
