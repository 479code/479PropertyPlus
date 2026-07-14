import { PeopleListPage } from './PeopleListPage';

export function TenantListPage() {
  return (
    <PeopleListPage
      title="Tenants"
      description="Everyone currently holding the Tenant role."
      breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Tenants' }]}
      lockedRoleName="Tenant"
    />
  );
}
