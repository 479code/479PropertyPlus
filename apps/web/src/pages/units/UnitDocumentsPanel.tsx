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
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type UnitDocument, type UnitDocumentType } from '../../features/inventory/types';
import {
  useAddUnitDocument,
  useRemoveUnitDocument,
  useUnitDocuments,
} from '../../features/inventory/use-unit-media';

const DOCUMENT_TYPES: UnitDocumentType[] = [
  'FLOOR_PLAN',
  'INSPECTION_REPORT',
  'WARRANTY',
  'CERTIFICATE',
  'MAINTENANCE_MANUAL',
  'OTHER',
];

const schema = z.object({
  documentType: z.enum([
    'FLOOR_PLAN',
    'INSPECTION_REPORT',
    'WARRANTY',
    'CERTIFICATE',
    'MAINTENANCE_MANUAL',
    'OTHER',
  ]),
  name: z.string().min(1, 'Name is required').max(200),
  url: z.string().url('Enter a valid URL'),
  description: z.string().max(500).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function UnitDocumentsPanel({ unitId }: { unitId: string }) {
  const { data: documents, isLoading } = useUnitDocuments(unitId);
  const addDocument = useAddUnitDocument(unitId);
  const removeDocument = useRemoveUnitDocument(unitId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnitDocument | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { documentType: 'OTHER', name: '', url: '', description: '' },
  });

  async function submit(values: FormValues) {
    try {
      await addDocument.mutateAsync({
        documentType: values.documentType,
        name: values.name,
        url: values.url,
        description: values.description || undefined,
      });
      toast.success('Document added');
      form.reset({ documentType: 'OTHER', name: '', url: '', description: '' });
      setDialogOpen(false);
    } catch {
      toast.error('Could not add document');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Document metadata only — no file uploads yet.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add document</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="documentType">Type</Label>
                <Select
                  value={form.watch('documentType')}
                  onValueChange={(v) => form.setValue('documentType', v as UnitDocumentType)}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-name">Name</Label>
                <Input id="doc-name" placeholder="Floor Plan A" {...form.register('name')} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-url">URL</Label>
                <Input
                  id="doc-url"
                  placeholder="https://cdn.example.com/plan.pdf"
                  {...form.register('url')}
                />
                {form.formState.errors.url ? (
                  <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
                ) : null}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addDocument.isPending}>
                  {addDocument.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? null : !documents || documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Add a document URL to get started."
        />
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <Badge variant="secondary" className="mt-1">
                    {doc.documentType.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild aria-label="Open">
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(doc)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this document?"
        destructive
        loading={removeDocument.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeDocument.mutateAsync(deleteTarget.id);
            toast.success('Document removed');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not remove document');
          }
        }}
      />
    </div>
  );
}
