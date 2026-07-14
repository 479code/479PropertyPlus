import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type ContactHistoryEntry, type ContactHistoryType } from '../../features/crm/types';
import {
  useAddContactHistory,
  useContactHistory,
  useRemoveContactHistory,
} from '../../features/crm/use-crm-support';

const TYPES: ContactHistoryType[] = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'SMS', 'WHATSAPP'];

const schema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'SMS', 'WHATSAPP']),
  subject: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function ContactTimelinePanel({ personId }: { personId: string }) {
  const { data: entries, isLoading } = useContactHistory(personId);
  const addEntry = useAddContactHistory(personId);
  const removeEntry = useRemoveContactHistory(personId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactHistoryEntry | null>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'NOTE', subject: '', notes: '' },
  });

  async function submit(values: FormValues) {
    try {
      await addEntry.mutateAsync({
        type: values.type,
        subject: values.subject || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Logged');
      reset({ type: 'NOTE', subject: '', notes: '' });
      setDialogOpen(false);
    } catch {
      toast.error('Could not log this entry');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Log interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log an interaction</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) => setValue('type', v as ContactHistoryType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...register('subject')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...register('notes')} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addEntry.isPending}>
                  {addEntry.isPending ? 'Logging…' : 'Log'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity logged yet"
          description="Calls, emails, meetings, and notes will appear here."
        />
      ) : (
        <ol className="space-y-4 border-l pl-4">
          {entries.map((entry) => (
            <li key={entry.id} className="group relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{entry.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.occurredAt), 'PPp')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={() => setDeleteTarget(entry)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {entry.subject ? <p className="mt-1 text-sm font-medium">{entry.subject}</p> : null}
              {entry.notes ? (
                <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this entry?"
        destructive
        loading={removeEntry.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeEntry.mutateAsync(deleteTarget.id);
            toast.success('Entry deleted');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not delete entry');
          }
        }}
      />
    </div>
  );
}
