import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type CreateUnitInput } from '../../features/inventory/units-api';
import { useFloors, useBuildings } from '../../features/inventory/use-buildings';
import {
  unitFeatureHooks,
  unitStatusHooks,
  unitTypeHooks,
} from '../../features/inventory/use-inventory-config';
import { usePropertiesList } from '../../features/property/use-properties';

const OWNER_TYPES = ['INDIVIDUAL', 'COMPANY', 'GOVERNMENT', 'TRUST', 'OTHER'] as const;

const numeric = () => z.coerce.number().min(0).optional().or(z.literal(''));

const schema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  buildingId: z.string().optional(),
  floorId: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(160),
  description: z.string().max(2000).optional().or(z.literal('')),
  unitCode: z.string().max(40).optional().or(z.literal('')),
  unitTypeId: z.string().min(1, 'Unit type is required'),
  statusId: z.string().min(1, 'Status is required'),
  isReserved: z.boolean(),
  isBlocked: z.boolean(),
  isRentable: z.boolean(),
  bedrooms: numeric(),
  bathrooms: numeric(),
  kitchens: numeric(),
  parkingSpaces: numeric(),
  size: numeric(),
  sizeUnit: z.string().max(20).optional().or(z.literal('')),
  monthlyRent: numeric(),
  annualRent: numeric(),
  securityDeposit: numeric(),
  serviceCharge: numeric(),
  expectedAnnualRevenue: numeric(),
  marketValue: numeric(),
  ownerType: z.enum(OWNER_TYPES).optional().or(z.literal('')),
  featureIds: z.array(z.string()),
});

export type UnitFormValues = z.infer<typeof schema>;

export interface UnitFormProps {
  defaultValues?: Partial<UnitFormValues>;
  onSubmit: (input: CreateUnitInput) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  lockProperty?: boolean;
}

function numOrUndefined(v: number | '' | undefined): number | undefined {
  return v === '' || v === undefined ? undefined : Number(v);
}

export function UnitForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  lockProperty,
}: UnitFormProps) {
  const properties = usePropertiesList();
  const buildings = useBuildings({ pageSize: 100 });
  const unitTypes = unitTypeHooks.useList();
  const unitStatuses = unitStatusHooks.useList();
  const unitFeatures = unitFeatureHooks.useList();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: '',
      name: '',
      isReserved: false,
      isBlocked: false,
      isRentable: true,
      featureIds: [],
      ...defaultValues,
    },
  });

  const buildingId = watch('buildingId');
  const floors = useFloors(buildingId);
  const selectedFeatureIds = watch('featureIds');

  async function submit(values: UnitFormValues) {
    await onSubmit({
      propertyId: values.propertyId,
      buildingId: values.buildingId || undefined,
      floorId: values.floorId || undefined,
      name: values.name,
      description: values.description || undefined,
      unitCode: values.unitCode || undefined,
      unitTypeId: values.unitTypeId,
      statusId: values.statusId,
      isReserved: values.isReserved,
      isBlocked: values.isBlocked,
      isRentable: values.isRentable,
      bedrooms: numOrUndefined(values.bedrooms),
      bathrooms: numOrUndefined(values.bathrooms),
      kitchens: numOrUndefined(values.kitchens),
      parkingSpaces: numOrUndefined(values.parkingSpaces),
      size: numOrUndefined(values.size),
      sizeUnit: values.sizeUnit || undefined,
      monthlyRent: numOrUndefined(values.monthlyRent),
      annualRent: numOrUndefined(values.annualRent),
      securityDeposit: numOrUndefined(values.securityDeposit),
      serviceCharge: numOrUndefined(values.serviceCharge),
      expectedAnnualRevenue: numOrUndefined(values.expectedAnnualRevenue),
      marketValue: numOrUndefined(values.marketValue),
      ownerType: values.ownerType || undefined,
      featureIds: values.featureIds,
    });
  }

  function toggleFeature(id: string, checked: boolean) {
    const next = checked ? [...selectedFeatureIds, id] : selectedFeatureIds.filter((f) => f !== id);
    setValue('featureIds', next);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property</Label>
            <Select
              value={watch('propertyId')}
              onValueChange={(v) => setValue('propertyId', v, { shouldValidate: true })}
              disabled={lockProperty}
            >
              <SelectTrigger id="propertyId">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.data?.items.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyId ? (
              <p className="text-sm text-destructive">{errors.propertyId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingId">Building</Label>
            <Select
              value={watch('buildingId')}
              onValueChange={(v) => {
                setValue('buildingId', v);
                setValue('floorId', undefined);
              }}
            >
              <SelectTrigger id="buildingId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {buildings.data?.items.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floorId">Floor</Label>
            <Select
              value={watch('floorId')}
              onValueChange={(v) => setValue('floorId', v)}
              disabled={!buildingId}
            >
              <SelectTrigger id="floorId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {floors.data?.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Unit name</Label>
            <Input id="name" placeholder="Apartment 1B" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitCode">Unit code (optional override)</Label>
            <Input
              id="unitCode"
              placeholder="Auto-generated if left blank"
              {...register('unitCode')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitTypeId">Unit type</Label>
            <Select
              value={watch('unitTypeId')}
              onValueChange={(v) => setValue('unitTypeId', v, { shouldValidate: true })}
            >
              <SelectTrigger id="unitTypeId">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {unitTypes.data?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitTypeId ? (
              <p className="text-sm text-destructive">{errors.unitTypeId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusId">Status</Label>
            <Select
              value={watch('statusId')}
              onValueChange={(v) => setValue('statusId', v, { shouldValidate: true })}
            >
              <SelectTrigger id="statusId">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {unitStatuses.data?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.statusId ? (
              <p className="text-sm text-destructive">{errors.statusId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" min={0} {...register('bedrooms')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" min={0} {...register('bathrooms')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kitchens">Kitchens</Label>
            <Input id="kitchens" type="number" min={0} {...register('kitchens')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parkingSpaces">Parking spaces</Label>
            <Input id="parkingSpaces" type="number" min={0} {...register('parkingSpaces')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input id="size" type="number" min={0} step="0.01" {...register('size')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sizeUnit">Size unit</Label>
            <Input id="sizeUnit" placeholder="sqm" {...register('sizeUnit')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Monthly rent</Label>
            <Input
              id="monthlyRent"
              type="number"
              min={0}
              step="0.01"
              {...register('monthlyRent')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualRent">Annual rent</Label>
            <Input id="annualRent" type="number" min={0} step="0.01" {...register('annualRent')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Security deposit</Label>
            <Input
              id="securityDeposit"
              type="number"
              min={0}
              step="0.01"
              {...register('securityDeposit')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceCharge">Service charge</Label>
            <Input
              id="serviceCharge"
              type="number"
              min={0}
              step="0.01"
              {...register('serviceCharge')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedAnnualRevenue">Expected annual revenue</Label>
            <Input
              id="expectedAnnualRevenue"
              type="number"
              min={0}
              step="0.01"
              {...register('expectedAnnualRevenue')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketValue">Market value</Label>
            <Input
              id="marketValue"
              type="number"
              min={0}
              step="0.01"
              {...register('marketValue')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ownership &amp; availability</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ownerType">Owner type</Label>
            <Select
              value={watch('ownerType') || undefined}
              onValueChange={(v) => setValue('ownerType', v as UnitFormValues['ownerType'])}
            >
              <SelectTrigger id="ownerType">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                {OWNER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="isRentable" className="cursor-pointer">
              Rentable
            </Label>
            <Switch
              id="isRentable"
              checked={watch('isRentable')}
              onCheckedChange={(v) => setValue('isRentable', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="isReserved" className="cursor-pointer">
              Reserved
            </Label>
            <Switch
              id="isReserved"
              checked={watch('isReserved')}
              onCheckedChange={(v) => setValue('isReserved', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="isBlocked" className="cursor-pointer">
              Blocked
            </Label>
            <Switch
              id="isBlocked"
              checked={watch('isBlocked')}
              onCheckedChange={(v) => setValue('isBlocked', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {unitFeatures.data?.map((feature) => (
            <label key={feature.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={selectedFeatureIds.includes(feature.id)}
                onCheckedChange={(checked) => toggleFeature(feature.id, checked === true)}
              />
              {feature.name}
            </label>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
