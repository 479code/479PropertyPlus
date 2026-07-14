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

import { type CompanyInput } from '../../features/crm/company-api';
import { usePeople } from '../../features/crm/use-people';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(160),
  registrationNumber: z.string().max(80).optional().or(z.literal('')),
  taxNumber: z.string().max(80).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  website: z.string().max(300).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  contactPersonId: z.string().optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
export type CompanyFormValues = z.infer<typeof schema>;

export interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (input: CompanyInput) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: CompanyFormProps) {
  const people = usePeople({ pageSize: 100 });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', ...defaultValues },
  });

  async function submit(values: CompanyFormValues) {
    await onSubmit({
      companyName: values.companyName,
      registrationNumber: values.registrationNumber || undefined,
      taxNumber: values.taxNumber || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      website: values.website || undefined,
      address: values.address || undefined,
      contactPersonId: values.contactPersonId || undefined,
      notes: values.notes || undefined,
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" {...register('companyName')} />
            {errors.companyName ? (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration number</Label>
            <Input id="registrationNumber" {...register('registrationNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxNumber">Tax number</Label>
            <Input id="taxNumber" {...register('taxNumber')} />
          </div>
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
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register('website')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPersonId">Primary contact person</Label>
            <Select
              value={watch('contactPersonId')}
              onValueChange={(v) => setValue('contactPersonId', v)}
            >
              <SelectTrigger id="contactPersonId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {people.data?.items.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register('notes')} />
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
