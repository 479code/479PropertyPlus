import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type CreatePersonInput } from '../../features/crm/person-api';
import { personTypeHooks } from '../../features/crm/use-crm-config';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  middleName: z.string().max(80).optional().or(z.literal('')),
  lastName: z.string().min(1, 'Last name is required').max(80),
  gender: z.string().max(20).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().max(40).optional().or(z.literal('')),
  nationality: z.string().max(80).optional().or(z.literal('')),
  occupation: z.string().max(120).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  alternatePhone: z.string().max(40).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: z.string().max(120).optional().or(z.literal('')),
  country: z.string().max(120).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  identificationType: z.string().max(60).optional().or(z.literal('')),
  identificationNumber: z.string().max(80).optional().or(z.literal('')),
  identificationExpiry: z.string().optional().or(z.literal('')),
  taxIdentificationNumber: z.string().max(80).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  roleIds: z.array(z.string()),
});

export type PersonFormValues = z.infer<typeof schema>;

export interface PersonFormProps {
  defaultValues?: Partial<PersonFormValues>;
  onSubmit: (input: CreatePersonInput) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

export function PersonForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: PersonFormProps) {
  const personTypes = personTypeHooks.useList();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', roleIds: [], ...defaultValues },
  });

  const selectedRoleIds = watch('roleIds');

  function toggleRole(id: string, checked: boolean) {
    setValue(
      'roleIds',
      checked ? [...selectedRoleIds, id] : selectedRoleIds.filter((r) => r !== id),
    );
  }

  async function submit(values: PersonFormValues) {
    await onSubmit({
      firstName: values.firstName,
      middleName: values.middleName || undefined,
      lastName: values.lastName,
      gender: values.gender || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      maritalStatus: values.maritalStatus || undefined,
      nationality: values.nationality || undefined,
      occupation: values.occupation || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      alternatePhone: values.alternatePhone || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      country: values.country || undefined,
      postalCode: values.postalCode || undefined,
      identificationType: values.identificationType || undefined,
      identificationNumber: values.identificationNumber || undefined,
      identificationExpiry: values.identificationExpiry || undefined,
      taxIdentificationNumber: values.taxIdentificationNumber || undefined,
      notes: values.notes || undefined,
      roleIds: values.roleIds,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName ? (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle name</Label>
            <Input id="middleName" {...register('middleName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName ? (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" {...register('gender')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital status</Label>
            <Input id="maritalStatus" {...register('maritalStatus')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" {...register('nationality')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" {...register('occupation')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate phone</Label>
            <Input id="alternatePhone" {...register('alternatePhone')} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" {...register('postalCode')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="identificationType">ID type</Label>
            <Input
              id="identificationType"
              placeholder="Passport, National ID…"
              {...register('identificationType')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificationNumber">ID number</Label>
            <Input id="identificationNumber" {...register('identificationNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identificationExpiry">ID expiry</Label>
            <Input id="identificationExpiry" type="date" {...register('identificationExpiry')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxIdentificationNumber">Tax ID</Label>
            <Input id="taxIdentificationNumber" {...register('taxIdentificationNumber')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {personTypes.data?.map((type) => (
            <label key={type.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={selectedRoleIds.includes(type.id)}
                onCheckedChange={(checked) => toggleRole(type.id, checked === true)}
              />
              {type.name}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} {...register('notes')} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
