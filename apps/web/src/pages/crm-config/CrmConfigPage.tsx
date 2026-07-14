import { Tabs, TabsContent, TabsList, TabsTrigger } from '@479property/ui';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigManagerCard } from '../../components/shared/ConfigManagerCard';
import { personTagHooks, personTypeHooks } from '../../features/crm/use-crm-config';

export function CrmConfigPage() {
  const personTypes = personTypeHooks.useList();
  const personTypeCreate = personTypeHooks.useCreate();
  const personTypeUpdate = personTypeHooks.useUpdate();
  const personTypeRemove = personTypeHooks.useRemove();

  const personTags = personTagHooks.useList();
  const personTagCreate = personTagHooks.useCreate();
  const personTagUpdate = personTagHooks.useUpdate();
  const personTagRemove = personTagHooks.useRemove();

  return (
    <div>
      <PageHeader
        title="CRM Setup"
        description="Configure the role types and tags used across people."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'CRM Setup' }]}
      />

      <Tabs defaultValue="person-types">
        <TabsList>
          <TabsTrigger value="person-types">Person Types</TabsTrigger>
          <TabsTrigger value="person-tags">Person Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="person-types">
          <ConfigManagerCard
            title="Person Types"
            description="The roles a person can hold, e.g. Tenant, Owner, Agent."
            items={personTypes.data}
            isLoading={personTypes.isLoading}
            createMutation={personTypeCreate}
            updateMutation={personTypeUpdate}
            removeMutation={personTypeRemove}
          />
        </TabsContent>

        <TabsContent value="person-tags">
          <ConfigManagerCard
            title="Person Tags"
            description="Labels for quick filtering, e.g. VIP, Blacklisted."
            items={personTags.data}
            isLoading={personTags.isLoading}
            hasColor
            createMutation={personTagCreate}
            updateMutation={personTagUpdate}
            removeMutation={personTagRemove}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
