import { PeopleListPage } from './PeopleListPage';

export function AgentListPage() {
  return (
    <PeopleListPage
      title="Agents"
      description="Everyone currently holding the Agent role."
      breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Agents' }]}
      lockedRoleName="Agent"
    />
  );
}
