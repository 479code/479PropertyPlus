import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@479property/ui';
import { FileText, Plus, Trash2 } from 'lucide-react';

import { type LeaseWizardDraft, type WizardDocument } from '../wizard-types';

import { type StepProps } from './SelectPropertyStep';

const DOCUMENT_TYPES = [
  'LEASE_AGREEMENT',
  'SIGNED_CONTRACT',
  'ADDENDUM',
  'IDENTITY_DOCUMENT',
  'INSPECTION_REPORT',
  'HANDOVER_REPORT',
  'OTHER',
];

export function DocumentsStep({ draft, setDraft }: StepProps) {
  function addDocument() {
    const next: WizardDocument = { documentType: 'LEASE_AGREEMENT', name: '', url: '' };
    setDraft({ documents: [...draft.documents, next] } as Partial<LeaseWizardDraft>);
  }
  function updateDocument(index: number, patch: Partial<WizardDocument>) {
    const list = [...draft.documents];
    list[index] = { ...list[index], ...patch };
    setDraft({ documents: list });
  }
  function removeDocument(index: number) {
    setDraft({ documents: draft.documents.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Documents</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Optional, metadata only — no file uploads yet, just a name and URL. Documents attach after
        the lease is created.
      </p>

      <div className="mb-3 flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={addDocument}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add document
        </Button>
      </div>

      {draft.documents.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          No documents added — you can skip this step.
        </p>
      ) : (
        <div className="space-y-3">
          {draft.documents.map((d, i) => (
            <div key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-4">
              <Select
                value={d.documentType}
                onValueChange={(v) => updateDocument(i, { documentType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      <Badge variant="secondary" className="mr-1">
                        {t.replace(/_/g, ' ')}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Name"
                value={d.name}
                onChange={(e) => updateDocument(i, { name: e.target.value })}
              />
              <Input
                placeholder="URL"
                value={d.url}
                onChange={(e) => updateDocument(i, { url: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeDocument(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
