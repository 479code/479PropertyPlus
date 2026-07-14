import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCompanies } from '../../features/crm/use-companies';
import { useTenantProfile, useUpsertTenantProfile } from '../../features/crm/use-profiles';

const schema = z.object({
  companyId: z.string().optional(),
  employmentStatus: z.string().max(60).optional().or(z.literal('')),
  employer: z.string().max(160).optional().or(z.literal('')),
  monthlyIncome: z.coerce.number().min(0).optional().or(z.literal('')),
  preferredPaymentMethod: z.string().max(60).optional().or(z.literal('')),
  preferredCommunication: z.string().max(60).optional().or(z.literal('')),
  riskRating: z.string().max(40).optional().or(z.literal('')),
  creditScore: z.coerce.number().min(0).max(999).optional().or(z.literal('')),
  status: z.string().max(40).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function TenantProfilePanel({ personId }: { personId: string }) {
  const { data: profile, isLoading } = useTenantProfile(personId);
  const upsert = useUpsertTenantProfile(personId);
  const companies = useCompanies();

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: '',
      employmentStatus: '',
      employer: '',
      preferredPaymentMethod: '',
      preferredCommunication: '',
      riskRating: '',
      status: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyId: profile.companyId ?? '',
        employmentStatus: profile.employmentStatus ?? '',
        employer: profile.employer ?? '',
        monthlyIncome: profile.monthlyIncome ?? '',
        preferredPaymentMethod: profile.preferredPaymentMethod ?? '',
        preferredCommunication: profile.preferredCommunication ?? '',
        riskRating: profile.riskRating ?? '',
        creditScore: profile.creditScore ?? '',
        status: profile.status ?? '',
      });
    }
  }, [profile, reset]);

  async function submit(values: FormValues) {
    try {
      await upsert.mutateAsync({
        companyId: values.companyId || undefined,
        employmentStatus: values.employmentStatus || undefined,
        employer: values.employer || undefined,
        monthlyIncome: values.monthlyIncome === '' ? undefined : Number(values.monthlyIncome),
        preferredPaymentMethod: values.preferredPaymentMethod || undefined,
        preferredCommunication: values.preferredCommunication || undefined,
        riskRating: values.riskRating || undefined,
        creditScore: values.creditScore === '' ? undefined : Number(values.creditScore),
        status: values.status || undefined,
      });
      toast.success('Tenant profile saved');
    } catch {
      toast.error('Could not save tenant profile');
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        {!profile ? (
          <EmptyState
            icon={Briefcase}
            title="No tenant profile yet"
            description="Fill in the form below to create one."
            className="mb-6 border-none p-0"
          />
        ) : null}
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="companyId">Company (corporate tenant)</Label>
            <Select value={watch('companyId')} onValueChange={(v) => setValue('companyId', v)}>
              <SelectTrigger id="companyId">
                <SelectValue placeholder="None (individual tenant)" />
              </SelectTrigger>
              <SelectContent>
                {companies.data?.items.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input id="status" placeholder="Active, Prospect, Former…" {...register('status')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employmentStatus">Employment status</Label>
            <Input id="employmentStatus" {...register('employmentStatus')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer">Employer</Label>
            <Input id="employer" {...register('employer')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly income</Label>
            <Input
              id="monthlyIncome"
              type="number"
              min={0}
              step="0.01"
              {...register('monthlyIncome')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditScore">Credit score</Label>
            <Input id="creditScore" type="number" min={0} max={999} {...register('creditScore')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredPaymentMethod">Preferred payment method</Label>
            <Input id="preferredPaymentMethod" {...register('preferredPaymentMethod')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredCommunication">Preferred communication</Label>
            <Input id="preferredCommunication" {...register('preferredCommunication')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="riskRating">Risk rating</Label>
            <Input id="riskRating" {...register('riskRating')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save tenant profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
