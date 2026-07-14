import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type CreateBuildingInput } from '../../features/inventory/buildings-api';
import { buildingStatusHooks } from '../../features/inventory/use-inventory-config';
import { usePropertiesList } from '../../features/property/use-properties';

const schema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  name: z.string().min(1, 'Name is required').max(160),
  description: z.string().max(2000).optional().or(z.literal('')),
  buildingCode: z.string().max(40).optional().or(z.literal('')),
  numberOfFloors: z.coerce.number().int().min(0).optional().or(z.literal('')),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional().or(z.literal('')),
  statusId: z.string().optional(),
});

export type BuildingFormValues = z.infer<typeof schema>;

export interface BuildingFormProps {
  defaultValues?: Partial<BuildingFormValues>;
  onSubmit: (input: CreateBuildingInput) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  lockProperty?: boolean;
}

export function BuildingForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  lockProperty,
}: BuildingFormProps) {
  const properties = usePropertiesList();
  const buildingStatuses = buildingStatusHooks.useList();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: '',
      name: '',
      description: '',
      buildingCode: '',
      ...defaultValues,
    },
  });

  async function submit(values: BuildingFormValues) {
    await onSubmit({
      propertyId: values.propertyId,
      name: values.name,
      description: values.description || undefined,
      buildingCode: values.buildingCode || undefined,
      numberOfFloors: values.numberOfFloors === '' ? undefined : Number(values.numberOfFloors),
      yearBuilt: values.yearBuilt === '' ? undefined : Number(values.yearBuilt),
      statusId: values.statusId || undefined,
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-2 md:col-span-2">
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
                    {p.name} ({p.propertyCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyId ? (
              <p className="text-sm text-destructive">{errors.propertyId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Building name</Label>
            <Input id="name" placeholder="Block A" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildingCode">Building code (optional override)</Label>
            <Input
              id="buildingCode"
              placeholder="Auto-generated if left blank"
              {...register('buildingCode')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusId">Status</Label>
            <Select value={watch('statusId')} onValueChange={(v) => setValue('statusId', v)}>
              <SelectTrigger id="statusId">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {buildingStatuses.data?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfFloors">Number of floors</Label>
            <Input id="numberOfFloors" type="number" min={0} {...register('numberOfFloors')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Year built</Label>
            <Input id="yearBuilt" type="number" min={1800} max={2100} {...register('yearBuilt')} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register('description')} />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
