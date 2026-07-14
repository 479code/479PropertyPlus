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
  Switch,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { LifeBuoy, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type EmergencyContact } from '../../features/crm/types';
import {
  useAddEmergencyContact,
  useEmergencyContacts,
  useRemoveEmergencyContact,
} from '../../features/crm/use-crm-support';
import { usePeople } from '../../features/crm/use-people';

const schema = z.object({
  contactPersonId: z.string().min(1, 'Select a person'),
  relationship: z.string().min(1, 'Relationship is required').max(80),
  priority: z.coerce.number().min(0).optional().or(z.literal('')),
  isPrimary: z.boolean(),
  notes: z.string().max(500).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function EmergencyContactsPanel({ personId }: { personId: string }) {
  const { data: contacts, isLoading } = useEmergencyContacts(personId);
  const addContact = useAddEmergencyContact(personId);
  const removeContact = useRemoveEmergencyContact(personId);
  const people = usePeople({ pageSize: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactPersonId: '',
      relationship: '',
      priority: 0,
      isPrimary: false,
      notes: '',
    },
  });

  async function submit(values: FormValues) {
    try {
      await addContact.mutateAsync({
        contactPersonId: values.contactPersonId,
        relationship: values.relationship,
        priority: values.priority === '' ? undefined : Number(values.priority),
        isPrimary: values.isPrimary,
        notes: values.notes || undefined,
      });
      toast.success('Emergency contact added');
      reset({ contactPersonId: '', relationship: '', priority: 0, isPrimary: false, notes: '' });
      setDialogOpen(false);
    } catch {
      toast.error('Could not add emergency contact');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add emergency contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add emergency contact</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="contactPersonId">Person</Label>
                <Select
                  value={watch('contactPersonId')}
                  onValueChange={(v) => setValue('contactPersonId', v, { shouldValidate: true })}
                >
                  <SelectTrigger id="contactPersonId">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.data?.items
                      .filter((p) => p.id !== personId)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.fullName} ({p.personCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.contactPersonId ? (
                  <p className="text-sm text-destructive">{errors.contactPersonId.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  placeholder="Spouse, Sibling, Friend…"
                  {...register('relationship')}
                />
                {errors.relationship ? (
                  <p className="text-sm text-destructive">{errors.relationship.message}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Primary contact
                </Label>
                <Switch
                  id="isPrimary"
                  checked={watch('isPrimary')}
                  onCheckedChange={(v) => setValue('isPrimary', v)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addContact.isPending}>
                  {addContact.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !contacts || contacts.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No emergency contacts"
          description="Add someone to contact in case of emergency."
        />
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {contact.isPrimary ? (
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                ) : null}
                <div>
                  <Link
                    to={`/people/${contact.contactPersonId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {contact.contactPerson.fullName}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{contact.relationship}</Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(contact)}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this emergency contact?"
        destructive
        loading={removeContact.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeContact.mutateAsync(deleteTarget.id);
            toast.success('Emergency contact removed');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not remove emergency contact');
          }
        }}
      />
    </div>
  );
}
