import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@479property/ui';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { usePeople } from '../../features/crm/use-people';
import { type LeaseGuarantor } from '../../features/lease/types';
import {
  useAddLeaseGuarantor,
  useLeaseGuarantors,
  useRemoveLeaseGuarantor,
} from '../../features/lease/use-lease-support';

export function LeaseGuarantorsPanel({ leaseId }: { leaseId: string }) {
  const { data: guarantors, isLoading } = useLeaseGuarantors(leaseId);
  const addGuarantor = useAddLeaseGuarantor(leaseId);
  const removeGuarantor = useRemoveLeaseGuarantor(leaseId);
  const people = usePeople({ pageSize: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [personId, setPersonId] = useState('');
  const [relationship, setRelationship] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LeaseGuarantor | null>(null);

  async function submit() {
    if (!personId) return;
    try {
      await addGuarantor.mutateAsync({ personId, relationshipToTenant: relationship || undefined });
      toast.success('Guarantor added');
      setPersonId('');
      setRelationship('');
      setDialogOpen(false);
    } catch {
      toast.error('Could not add guarantor');
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add guarantor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add guarantor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {people.data?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Relationship to tenant"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submit}
                  disabled={addGuarantor.isPending || !personId}
                >
                  {addGuarantor.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !guarantors || guarantors.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No guarantors"
          description="This lease has no guarantors on file."
        />
      ) : (
        <div className="space-y-2">
          {guarantors.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{g.person.fullName}</p>
                {g.relationshipToTenant ? (
                  <p className="text-xs text-muted-foreground">{g.relationshipToTenant}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(g)}
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
        title="Remove this guarantor?"
        destructive
        loading={removeGuarantor.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeGuarantor.mutateAsync(deleteTarget.id);
            toast.success('Guarantor removed');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not remove guarantor');
          }
        }}
      />
    </div>
  );
}
