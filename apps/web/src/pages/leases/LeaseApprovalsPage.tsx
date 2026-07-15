import { LeasesListPage } from './LeasesListPage';

export function LeaseApprovalsPage() {
  return (
    <LeasesListPage
      title="Lease Approvals"
      description="Leases waiting for approval."
      breadcrumbs={[
        { label: 'Dashboard', to: '/' },
        { label: 'Leases', to: '/leases' },
        { label: 'Approvals' },
      ]}
      lockedStatusKey="PENDING_APPROVAL"
      hideCreate
    />
  );
}
