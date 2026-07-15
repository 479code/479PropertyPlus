import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Tags } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { type LeaseStatus } from '../../../features/lease/types';
import { useLeaseStatuses, useUpdateLeaseStatus } from '../../../features/lease/use-lease-config';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  color: z.string().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function LeaseStatusManagerCard() {
  const statuses = useLeaseStatuses();
  const updateStatus = useUpdateLeaseStatus();
  const [editing, setEditing] = useState<LeaseStatus | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: '' },
  });

  function openEdit(status: LeaseStatus) {
    setEditing(status);
    reset({ name: status.name, color: status.color ?? '' });
  }

  async function submit(values: FormValues) {
    if (!editing) return;
    try {
      await updateStatus.mutateAsync({
        id: editing.id,
        input: { name: values.name, color: values.color || undefined },
      });
      toast.success('Status updated');
      setEditing(null);
    } catch {
      toast.error('Could not update status');
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Lease Statuses</h3>
          <p className="text-sm text-muted-foreground">
            The lifecycle states that back the lease state machine. Only the label and color can be
            customized — the underlying behavior (which statuses block a unit or count as occupancy)
            is structural.
          </p>
        </div>

        {statuses.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !statuses.data || statuses.data.length === 0 ? (
          <EmptyState icon={Tags} title="No statuses configured" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blocks availability</TableHead>
                <TableHead>Counts as occupancy</TableHead>
                <TableHead className="w-16 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...statuses.data]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {status.color ? (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border"
                            style={{ backgroundColor: status.color }}
                          />
                        ) : null}
                        {status.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.blocksUnitAvailability ? 'warning' : 'secondary'}>
                        {status.blocksUnitAvailability ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.countsAsOccupancy ? 'success' : 'secondary'}>
                        {status.countsAsOccupancy ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(status)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit status</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="status-name">Name</Label>
              <Input id="status-name" {...register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-color">Color (hex)</Label>
              <Input id="status-color" placeholder="#2563eb" {...register('color')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStatus.isPending}>
                {updateStatus.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
