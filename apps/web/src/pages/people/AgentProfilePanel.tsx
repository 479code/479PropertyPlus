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
import { UserCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAgentProfile, useUpsertAgentProfile } from '../../features/crm/use-profiles';

const schema = z.object({
  agencyName: z.string().max(160).optional().or(z.literal('')),
  commissionRate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  licenceNumber: z.string().max(80).optional().or(z.literal('')),
  territory: z.string().max(160).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function AgentProfilePanel({ personId }: { personId: string }) {
  const { data: profile, isLoading } = useAgentProfile(personId);
  const upsert = useUpsertAgentProfile(personId);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { agencyName: '', licenceNumber: '', territory: '', notes: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        agencyName: profile.agencyName ?? '',
        commissionRate: profile.commissionRate ?? '',
        licenceNumber: profile.licenceNumber ?? '',
        territory: profile.territory ?? '',
        notes: profile.notes ?? '',
      });
    }
  }, [profile, reset]);

  async function submit(values: FormValues) {
    try {
      await upsert.mutateAsync({
        agencyName: values.agencyName || undefined,
        commissionRate: values.commissionRate === '' ? undefined : Number(values.commissionRate),
        licenceNumber: values.licenceNumber || undefined,
        territory: values.territory || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Agent profile saved');
    } catch {
      toast.error('Could not save agent profile');
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        {!profile ? (
          <EmptyState
            icon={UserCheck}
            title="No agent profile yet"
            description="Fill in the form below to create one."
            className="mb-6 border-none p-0"
          />
        ) : null}
        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(submit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency name</Label>
            <Input id="agencyName" {...register('agencyName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...register('commissionRate')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenceNumber">Licence number</Label>
            <Input id="licenceNumber" {...register('licenceNumber')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="territory">Territory</Label>
            <Input id="territory" {...register('territory')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save agent profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
