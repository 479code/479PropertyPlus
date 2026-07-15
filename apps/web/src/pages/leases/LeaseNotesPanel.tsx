import { Button, EmptyState, Skeleton, Textarea } from '@479property/ui';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type LeaseNote } from '../../features/lease/types';
import {
  useAddLeaseNote,
  useLeaseNotes,
  useRemoveLeaseNote,
} from '../../features/lease/use-lease-support';

export function LeaseNotesPanel({ leaseId }: { leaseId: string }) {
  const { data: notes, isLoading } = useLeaseNotes(leaseId);
  const addNote = useAddLeaseNote(leaseId);
  const removeNote = useRemoveLeaseNote(leaseId);
  const [text, setText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LeaseNote | null>(null);

  async function submit() {
    if (!text.trim()) return;
    try {
      await addNote.mutateAsync(text.trim());
      setText('');
    } catch {
      toast.error('Could not add note');
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Textarea
          placeholder="Add an internal note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
        <Button type="button" onClick={submit} disabled={addNote.isPending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !notes || notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No notes yet"
          description="Internal notes about this lease will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-start justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm">{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => setDeleteTarget(note)}
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this note?"
        destructive
        loading={removeNote.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeNote.mutateAsync(deleteTarget.id);
            toast.success('Note deleted');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not delete note');
          }
        }}
      />
    </div>
  );
}
