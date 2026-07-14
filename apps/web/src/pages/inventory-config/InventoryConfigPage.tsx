import { Tabs, TabsContent, TabsList, TabsTrigger } from '@479property/ui';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigManagerCard } from '../../components/shared/ConfigManagerCard';
import {
  buildingStatusHooks,
  unitFeatureHooks,
  unitStatusHooks,
  unitTypeHooks,
} from '../../features/inventory/use-inventory-config';

export function InventoryConfigPage() {
  const buildingStatuses = buildingStatusHooks.useList();
  const buildingStatusCreate = buildingStatusHooks.useCreate();
  const buildingStatusUpdate = buildingStatusHooks.useUpdate();
  const buildingStatusRemove = buildingStatusHooks.useRemove();

  const unitTypes = unitTypeHooks.useList();
  const unitTypeCreate = unitTypeHooks.useCreate();
  const unitTypeUpdate = unitTypeHooks.useUpdate();
  const unitTypeRemove = unitTypeHooks.useRemove();

  const unitStatuses = unitStatusHooks.useList();
  const unitStatusCreate = unitStatusHooks.useCreate();
  const unitStatusUpdate = unitStatusHooks.useUpdate();
  const unitStatusRemove = unitStatusHooks.useRemove();

  const unitFeatures = unitFeatureHooks.useList();
  const unitFeatureCreate = unitFeatureHooks.useCreate();
  const unitFeatureUpdate = unitFeatureHooks.useUpdate();
  const unitFeatureRemove = unitFeatureHooks.useRemove();

  return (
    <div>
      <PageHeader
        title="Inventory Setup"
        description="Configure the statuses, types, and features used across buildings and units."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Inventory Setup' }]}
      />

      <Tabs defaultValue="building-statuses">
        <TabsList>
          <TabsTrigger value="building-statuses">Building Statuses</TabsTrigger>
          <TabsTrigger value="unit-types">Unit Types</TabsTrigger>
          <TabsTrigger value="unit-statuses">Unit Statuses</TabsTrigger>
          <TabsTrigger value="unit-features">Unit Features</TabsTrigger>
        </TabsList>

        <TabsContent value="building-statuses">
          <ConfigManagerCard
            title="Building Statuses"
            description="Lifecycle states a building can be in, e.g. Active, Under Construction."
            items={buildingStatuses.data}
            isLoading={buildingStatuses.isLoading}
            hasColor
            createMutation={buildingStatusCreate}
            updateMutation={buildingStatusUpdate}
            removeMutation={buildingStatusRemove}
          />
        </TabsContent>

        <TabsContent value="unit-types">
          <ConfigManagerCard
            title="Unit Types"
            description="The kind of space a unit is, e.g. Apartment, Office, Warehouse."
            items={unitTypes.data}
            isLoading={unitTypes.isLoading}
            hasColor
            hasIcon
            createMutation={unitTypeCreate}
            updateMutation={unitTypeUpdate}
            removeMutation={unitTypeRemove}
          />
        </TabsContent>

        <TabsContent value="unit-statuses">
          <ConfigManagerCard
            title="Unit Statuses"
            description="Manual status labels a unit can carry, in addition to computed availability."
            items={unitStatuses.data}
            isLoading={unitStatuses.isLoading}
            hasColor
            createMutation={unitStatusCreate}
            updateMutation={unitStatusUpdate}
            removeMutation={unitStatusRemove}
          />
        </TabsContent>

        <TabsContent value="unit-features">
          <ConfigManagerCard
            title="Unit Features"
            description="Amenities and attributes units can be tagged with, e.g. Balcony, Generator."
            items={unitFeatures.data}
            isLoading={unitFeatures.isLoading}
            hasIcon
            createMutation={unitFeatureCreate}
            updateMutation={unitFeatureUpdate}
            removeMutation={unitFeatureRemove}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
