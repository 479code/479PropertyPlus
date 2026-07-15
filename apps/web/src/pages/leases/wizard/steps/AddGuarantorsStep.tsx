import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@479property/ui';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePeople } from '../../../../features/crm/use-people';
import { useTenantProfile } from '../../../../features/crm/use-profiles';
import { type LeaseWizardDraft, type WizardGuarantor } from '../wizard-types';

import { type StepProps } from './SelectPropertyStep';

export function AddGuarantorsStep({ draft, setDraft }: StepProps) {
  const people = usePeople({ pageSize: 100 });
  const tenantProfile = useTenantProfile(draft.primaryTenantId || undefined);
  const [suggestedApplied, setSuggestedApplied] = useState(false);

  const suggestedGuarantorId = tenantProfile.data?.defaultGuarantorPersonId ?? null;

  useEffect(() => {
    setSuggestedApplied(false);
  }, [draft.primaryTenantId]);

  const availablePeople = people.data?.items ?? [];
  const suggestedPerson = suggestedGuarantorId
    ? availablePeople.find((p) => p.id === suggestedGuarantorId)
    : undefined;

  function addGuarantor(prefill?: Partial<WizardGuarantor>) {
    const next: WizardGuarantor = { personId: '', personName: '', ...prefill };
    setDraft({ guarantors: [...draft.guarantors, next] } as Partial<LeaseWizardDraft>);
  }
  function updateGuarantor(index: number, patch: Partial<WizardGuarantor>) {
    const list = [...draft.guarantors];
    list[index] = { ...list[index], ...patch };
    setDraft({ guarantors: list });
  }
  function removeGuarantor(index: number) {
    setDraft({ guarantors: draft.guarantors.filter((_, i) => i !== index) });
  }

  const alreadyAdded = draft.guarantors.some((g) => g.personId === suggestedGuarantorId);

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Guarantors</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Optional. Someone financially responsible if the tenant defaults.
      </p>

      {suggestedPerson && !alreadyAdded && !suggestedApplied ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-dashed p-3 text-sm">
          <span>
            <strong>{suggestedPerson.fullName}</strong> is set as this tenant&apos;s default
            guarantor. Add them?
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              addGuarantor({ personId: suggestedPerson.id, personName: suggestedPerson.fullName });
              setSuggestedApplied(true);
            }}
          >
            Add
          </Button>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {draft.guarantors.length} guarantor(s) added
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => addGuarantor()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add guarantor
        </Button>
      </div>

      {draft.guarantors.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          No guarantors added — that&apos;s fine, they&apos;re optional.
        </p>
      ) : (
        <div className="space-y-3">
          {draft.guarantors.map((g, i) => (
            <div key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-4">
              <Select
                value={g.personId}
                onValueChange={(v) => {
                  const person = availablePeople.find((p) => p.id === v);
                  updateGuarantor(i, { personId: v, personName: person?.fullName ?? '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Guarantee type"
                value={g.guaranteeType ?? ''}
                onChange={(e) => updateGuarantor(i, { guaranteeType: e.target.value })}
              />
              <Input
                placeholder="Relationship to tenant"
                value={g.relationshipToTenant ?? ''}
                onChange={(e) => updateGuarantor(i, { relationshipToTenant: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Guarantee amount"
                  value={g.guaranteeAmount ?? ''}
                  onChange={(e) =>
                    updateGuarantor(i, {
                      guaranteeAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeGuarantor(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
