import { Button } from '@479property/ui';
import { type AxiosError } from 'axios';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { submitLease } from '../../../../features/lease/lease-api';
import { addLeaseDocument } from '../../../../features/lease/lease-support-api';
import { useCreateLease } from '../../../../features/lease/use-leases';
import { type LeaseWizardDraft } from '../wizard-types';

export function SubmitStep({ draft }: { draft: LeaseWizardDraft }) {
  const createLease = useCreateLease();
  const navigate = useNavigate();
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null);

  async function finalize(alsoSubmit: boolean) {
    setSaving(alsoSubmit ? 'submit' : 'draft');
    try {
      const lease = await createLease.mutateAsync({
        propertyId: draft.propertyId,
        buildingId: draft.buildingId,
        unitId: draft.unitId,
        primaryTenantId: draft.primaryTenantId,
        leaseTypeId: draft.leaseTypeId,
        paymentFrequencyId: draft.paymentFrequencyId,
        leaseReference: draft.leaseReference,
        leaseStartDate: draft.leaseStartDate,
        leaseEndDate: draft.leaseEndDate,
        moveInDate: draft.moveInDate,
        moveOutDate: draft.moveOutDate,
        leaseDurationMonths: draft.leaseDurationMonths,
        renewalNoticeDays: draft.renewalNoticeDays,
        gracePeriodDays: draft.gracePeriodDays,
        securityDeposit: draft.securityDeposit,
        monthlyRent: draft.monthlyRent,
        annualRent: draft.annualRent,
        serviceCharge: draft.serviceCharge,
        utilityCharge: draft.utilityCharge,
        parkingCharge: draft.parkingCharge,
        discount: draft.discount,
        taxAmount: draft.taxAmount,
        totalRecurringAmount: draft.totalRecurringAmount,
        billingCycle: draft.billingCycle,
        autoRenew: draft.autoRenew,
        notes: draft.notes,
        additionalTenants: draft.additionalTenants.map((t) => ({
          personId: t.personId,
          role: t.role,
        })),
        guarantors: draft.guarantors.map((g) => ({
          personId: g.personId,
          guaranteeType: g.guaranteeType,
          guaranteeAmount: g.guaranteeAmount,
          relationshipToTenant: g.relationshipToTenant,
        })),
      });

      for (const doc of draft.documents) {
        if (doc.name && doc.url) {
          await addLeaseDocument(lease.id, {
            documentType: doc.documentType as never,
            name: doc.name,
            url: doc.url,
          });
        }
      }

      if (alsoSubmit) {
        await submitLease(lease.id);
        toast.success('Lease created and submitted for approval');
      } else {
        toast.success('Lease saved as draft');
      }
      navigate(`/leases/${lease.id}`);
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      toast.error(
        status === 409 ? 'This unit already has a conflicting lease' : 'Could not create the lease',
      );
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <CheckCircle2 className="h-12 w-12 text-primary" />
      <h2 className="text-lg font-semibold">Ready to create this lease</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Save it as a draft to keep working on it later, or submit it straight into the approval
        workflow.
      </p>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => finalize(false)}
          disabled={saving !== null}
        >
          {saving === 'draft' ? 'Saving…' : 'Save as draft'}
        </Button>
        <Button type="button" onClick={() => finalize(true)} disabled={saving !== null}>
          {saving === 'submit' ? 'Submitting…' : 'Create & submit for approval'}
        </Button>
      </div>
    </div>
  );
}
