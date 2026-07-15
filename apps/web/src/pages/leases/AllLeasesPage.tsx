import { LeasesListPage } from './LeasesListPage';

export function AllLeasesPage() {
  return (
    <LeasesListPage
      title="Leases"
      description="Every lease across your portfolio."
      breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Leases' }]}
    />
  );
}
