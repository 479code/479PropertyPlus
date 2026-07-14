import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Label,
  Skeleton,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useOwnerProfile, useUpsertOwnerProfile } from '../../features/crm/use-profiles';

const schema = z.object({
  ownershipType: z.string().max(60).optional().or(z.literal('')),
  bankName: z.string().max(120).optional().or(z.literal('')),
  accountName: z.string().max(120).optional().or(z.literal('')),
  payoutPreference: z.string().max(60).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function OwnerProfilePanel({ personId }: { personId: string }) {
  const { data: profile, isLoading } = useOwnerProfile(personId);
  const upsert = useUpsertOwnerProfile(personId);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownershipType: '',
      bankName: '',
      accountName: '',
      payoutPreference: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (profile) {
      const bank = (profile.bankDetails ?? {}) as { bankName?: string; accountName?: string };
      reset({
        ownershipType: profile.ownershipType ?? '',
        bankName: bank.bankName ?? '',
        accountName: bank.accountName ?? '',
        payoutPreference: profile.payoutPreference ?? '',
        notes: profile.notes ?? '',
      });
    }
  }, [profile, reset]);

  async function submit(values: FormValues) {
    try {
      await upsert.mutateAsync({
        ownershipType: values.ownershipType || undefined,
        bankDetails:
          values.bankName || values.accountName
            ? { bankName: values.bankName, accountName: values.accountName }
            : undefined,
        payoutPreference: values.payoutPreference || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Owner profile saved');
    } catch {
      toast.error('Could not save owner profile');
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        {!profile ? (
          <EmptyState
            icon={Home}
            title="No owner profile yet"
            description="Fill in the form below to create one."
            className="mb-6 border-none p-0"
          />
        ) : null}
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="ownershipType">Ownership type</Label>
            <Input id="ownershipType" {...register('ownershipType')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payoutPreference">Payout preference</Label>
            <Input id="payoutPreference" {...register('payoutPreference')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input id="bankName" {...register('bankName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account name</Label>
            <Input id="accountName" {...register('accountName')} />
          </div>
          <p className="text-xs text-muted-foreground md:col-span-2">
            Account numbers are never stored here — only non-sensitive metadata like bank/account
            name.
          </p>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save owner profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
