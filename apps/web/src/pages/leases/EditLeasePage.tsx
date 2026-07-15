import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageHeader } from '../../components/layout/PageHeader';
import { leaseTypeHooks, paymentFrequencyHooks } from '../../features/lease/use-lease-config';
import { useLease, useUpdateLease } from '../../features/lease/use-leases';

const schema = z.object({
  leaseTypeId: z.string().min(1),
  paymentFrequencyId: z.string().optional(),
  leaseReference: z.string().max(60).optional().or(z.literal('')),
  leaseStartDate: z.string().min(1),
  leaseEndDate: z.string().min(1),
  moveInDate: z.string().optional().or(z.literal('')),
  moveOutDate: z.string().optional().or(z.literal('')),
  leaseDurationMonths: z.coerce.number().min(0).optional().or(z.literal('')),
  renewalNoticeDays: z.coerce.number().min(0).optional().or(z.literal('')),
  gracePeriodDays: z.coerce.number().min(0).optional().or(z.literal('')),
  monthlyRent: z.coerce.number().min(0).optional().or(z.literal('')),
  annualRent: z.coerce.number().min(0).optional().or(z.literal('')),
  securityDeposit: z.coerce.number().min(0).optional().or(z.literal('')),
  serviceCharge: z.coerce.number().min(0).optional().or(z.literal('')),
  autoRenew: z.boolean(),
  notes: z.string().max(4000).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function EditLeasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lease, isLoading } = useLease(id);
  const updateLease = useUpdateLease(id as string);
  const leaseTypes = leaseTypeHooks.useList();
  const paymentFrequencies = paymentFrequencyHooks.useList();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { leaseTypeId: '', leaseStartDate: '', leaseEndDate: '', autoRenew: false },
    values: lease
      ? {
          leaseTypeId: lease.leaseTypeId,
          paymentFrequencyId: lease.paymentFrequencyId ?? undefined,
          leaseReference: lease.leaseReference ?? '',
          leaseStartDate: lease.leaseStartDate.slice(0, 10),
          leaseEndDate: lease.leaseEndDate.slice(0, 10),
          moveInDate: lease.moveInDate?.slice(0, 10) ?? '',
          moveOutDate: lease.moveOutDate?.slice(0, 10) ?? '',
          leaseDurationMonths: lease.leaseDurationMonths ?? '',
          renewalNoticeDays: lease.renewalNoticeDays ?? '',
          gracePeriodDays: lease.gracePeriodDays ?? '',
          monthlyRent: lease.monthlyRent ?? '',
          annualRent: lease.annualRent ?? '',
          securityDeposit: lease.securityDeposit ?? '',
          serviceCharge: lease.serviceCharge ?? '',
          autoRenew: lease.autoRenew,
          notes: lease.notes ?? '',
        }
      : undefined,
  });

  async function submit(values: FormValues) {
    try {
      await updateLease.mutateAsync({
        leaseTypeId: values.leaseTypeId,
        paymentFrequencyId: values.paymentFrequencyId || undefined,
        leaseReference: values.leaseReference || undefined,
        leaseStartDate: values.leaseStartDate,
        leaseEndDate: values.leaseEndDate,
        moveInDate: values.moveInDate || undefined,
        moveOutDate: values.moveOutDate || undefined,
        leaseDurationMonths:
          values.leaseDurationMonths === '' ? undefined : Number(values.leaseDurationMonths),
        renewalNoticeDays:
          values.renewalNoticeDays === '' ? undefined : Number(values.renewalNoticeDays),
        gracePeriodDays: values.gracePeriodDays === '' ? undefined : Number(values.gracePeriodDays),
        monthlyRent: values.monthlyRent === '' ? undefined : Number(values.monthlyRent),
        annualRent: values.annualRent === '' ? undefined : Number(values.annualRent),
        securityDeposit: values.securityDeposit === '' ? undefined : Number(values.securityDeposit),
        serviceCharge: values.serviceCharge === '' ? undefined : Number(values.serviceCharge),
        autoRenew: values.autoRenew,
        notes: values.notes || undefined,
      });
      toast.success('Lease updated');
      navigate(`/leases/${id}`);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      toast.error(
        status === 400
          ? 'Only Draft or Rejected leases can be edited this way'
          : 'Could not save changes',
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Edit lease"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Leases', to: '/leases' },
          { label: lease?.leaseNumber ?? '…', to: `/leases/${id}` },
          { label: 'Edit' },
        ]}
      />

      {isLoading || !lease ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(submit)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Lease details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leaseTypeId">Lease type</Label>
                <Select
                  value={watch('leaseTypeId')}
                  onValueChange={(v) => setValue('leaseTypeId', v)}
                >
                  <SelectTrigger id="leaseTypeId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaseTypes.data?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseReference">Lease reference</Label>
                <Input id="leaseReference" {...register('leaseReference')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseStartDate">Start date</Label>
                <Input id="leaseStartDate" type="date" {...register('leaseStartDate')} />
                {errors.leaseStartDate ? (
                  <p className="text-sm text-destructive">Required</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEndDate">End date</Label>
                <Input id="leaseEndDate" type="date" {...register('leaseEndDate')} />
                {errors.leaseEndDate ? <p className="text-sm text-destructive">Required</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in date</Label>
                <Input id="moveInDate" type="date" {...register('moveInDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moveOutDate">Move-out date</Label>
                <Input id="moveOutDate" type="date" {...register('moveOutDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseDurationMonths">Duration (months)</Label>
                <Input
                  id="leaseDurationMonths"
                  type="number"
                  min={0}
                  {...register('leaseDurationMonths')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renewalNoticeDays">Renewal notice (days)</Label>
                <Input
                  id="renewalNoticeDays"
                  type="number"
                  min={0}
                  {...register('renewalNoticeDays')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gracePeriodDays">Grace period (days)</Label>
                <Input
                  id="gracePeriodDays"
                  type="number"
                  min={0}
                  {...register('gracePeriodDays')}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="autoRenew" className="cursor-pointer">
                  Auto-renew
                </Label>
                <Switch
                  id="autoRenew"
                  checked={watch('autoRenew')}
                  onCheckedChange={(v) => setValue('autoRenew', v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
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
                <Input
                  id="annualRent"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register('annualRent')}
                />
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
                <Label htmlFor="paymentFrequencyId">Payment frequency</Label>
                <Select
                  value={watch('paymentFrequencyId')}
                  onValueChange={(v) => setValue('paymentFrequencyId', v)}
                >
                  <SelectTrigger id="paymentFrequencyId">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentFrequencies.data?.map((f) => (
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
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={4} {...register('notes')} />
            </CardContent>
          </Card>

          <Button type="submit" disabled={updateLease.isPending}>
            {updateLease.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      )}
    </div>
  );
}
