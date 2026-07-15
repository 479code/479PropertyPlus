import { Tabs, TabsContent, TabsList, TabsTrigger } from '@479property/ui';

import { PageHeader } from '../../../components/layout/PageHeader';
import { ConfigManagerCard } from '../../../components/shared/ConfigManagerCard';
import { leaseTypeHooks, paymentFrequencyHooks } from '../../../features/lease/use-lease-config';

import { LeaseStatusManagerCard } from './LeaseStatusManagerCard';

export function LeaseConfigPage() {
  const leaseTypes = leaseTypeHooks.useList();
  const leaseTypeCreate = leaseTypeHooks.useCreate();
  const leaseTypeUpdate = leaseTypeHooks.useUpdate();
  const leaseTypeRemove = leaseTypeHooks.useRemove();

  const paymentFrequencies = paymentFrequencyHooks.useList();
  const paymentFrequencyCreate = paymentFrequencyHooks.useCreate();
  const paymentFrequencyUpdate = paymentFrequencyHooks.useUpdate();
  const paymentFrequencyRemove = paymentFrequencyHooks.useRemove();

  return (
    <div>
      <PageHeader
        title="Lease Setup"
        description="Configure lease types, payment frequencies, and lifecycle statuses."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Lease Setup' }]}
      />

      <Tabs defaultValue="lease-types">
        <TabsList>
          <TabsTrigger value="lease-types">Lease Types</TabsTrigger>
          <TabsTrigger value="payment-frequencies">Payment Frequencies</TabsTrigger>
          <TabsTrigger value="lease-statuses">Lease Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="lease-types">
          <ConfigManagerCard
            title="Lease Types"
            description="e.g. Residential, Commercial, Short Stay."
            items={leaseTypes.data}
            isLoading={leaseTypes.isLoading}
            createMutation={leaseTypeCreate}
            updateMutation={leaseTypeUpdate}
            removeMutation={leaseTypeRemove}
          />
        </TabsContent>

        <TabsContent value="payment-frequencies">
          <ConfigManagerCard
            title="Payment Frequencies"
            description="e.g. Weekly, Monthly, Annual."
            items={paymentFrequencies.data}
            isLoading={paymentFrequencies.isLoading}
            createMutation={paymentFrequencyCreate}
            updateMutation={paymentFrequencyUpdate}
            removeMutation={paymentFrequencyRemove}
          />
        </TabsContent>

        <TabsContent value="lease-statuses">
          <LeaseStatusManagerCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
