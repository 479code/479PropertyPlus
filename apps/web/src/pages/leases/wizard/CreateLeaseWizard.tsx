import { useState } from 'react';

import { PageHeader } from '../../../components/layout/PageHeader';

import { AddGuarantorsStep } from './steps/AddGuarantorsStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { FinancialDetailsStep } from './steps/FinancialDetailsStep';
import { LeaseDetailsStep } from './steps/LeaseDetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { SelectBuildingStep } from './steps/SelectBuildingStep';
import { SelectPropertyStep } from './steps/SelectPropertyStep';
import { SelectTenantsStep } from './steps/SelectTenantsStep';
import { SelectUnitStep } from './steps/SelectUnitStep';
import { SubmitStep } from './steps/SubmitStep';
import { emptyDraft, type LeaseWizardDraft } from './wizard-types';
import { WizardShell } from './WizardShell';

function isStepValid(step: number, draft: LeaseWizardDraft): boolean {
  switch (step) {
    case 0:
      return !!draft.propertyId;
    case 1:
      return true; // building is optional
    case 2:
      return !!draft.unitId;
    case 3:
      return !!draft.primaryTenantId;
    case 4:
      return true; // guarantors optional
    case 5:
      return !!draft.leaseTypeId && !!draft.leaseStartDate && !!draft.leaseEndDate;
    case 6:
      return true; // financials optional
    case 7:
      return true; // documents optional
    case 8:
      return true; // review
    default:
      return true;
  }
}

export function CreateLeaseWizard() {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [draft, setDraftState] = useState<LeaseWizardDraft>(emptyDraft());

  function setDraft(patch: Partial<LeaseWizardDraft>) {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    const next = Math.min(step + 1, 9);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const stepProps = { draft, setDraft };

  return (
    <div>
      <PageHeader
        title="New lease"
        description="A guided, 10-step lease creation flow."
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Leases', to: '/leases' },
          { label: 'New' },
        ]}
      />

      <WizardShell
        currentStep={step}
        maxReachedStep={maxReached}
        onStepClick={setStep}
        onBack={step > 0 ? goBack : undefined}
        onNext={step < 9 ? goNext : undefined}
        nextDisabled={!isStepValid(step, draft)}
        hideNext={step === 9}
      >
        {step === 0 ? <SelectPropertyStep {...stepProps} /> : null}
        {step === 1 ? <SelectBuildingStep {...stepProps} /> : null}
        {step === 2 ? <SelectUnitStep {...stepProps} /> : null}
        {step === 3 ? <SelectTenantsStep {...stepProps} /> : null}
        {step === 4 ? <AddGuarantorsStep {...stepProps} /> : null}
        {step === 5 ? <LeaseDetailsStep {...stepProps} /> : null}
        {step === 6 ? <FinancialDetailsStep {...stepProps} /> : null}
        {step === 7 ? <DocumentsStep {...stepProps} /> : null}
        {step === 8 ? <ReviewStep {...stepProps} /> : null}
        {step === 9 ? <SubmitStep draft={draft} /> : null}
      </WizardShell>
    </div>
  );
}
