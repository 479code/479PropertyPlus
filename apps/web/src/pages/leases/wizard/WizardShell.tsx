import { Button, cn } from '@479property/ui';
import { Check } from 'lucide-react';
import { type ReactNode } from 'react';

import { WIZARD_STEPS } from './wizard-types';

export interface WizardShellProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxReachedStep: number;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  hideNext?: boolean;
}

export function WizardShell({
  currentStep,
  onStepClick,
  maxReachedStep,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
  isLoading,
  hideNext,
}: WizardShellProps) {
  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2">
        {WIZARD_STEPS.map((label, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          const isReachable = index <= maxReachedStep;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick?.(index)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isDone
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : isReachable
                        ? 'border-input text-muted-foreground hover:bg-accent'
                        : 'cursor-not-allowed border-input text-muted-foreground/40',
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : <span>{index + 1}</span>}
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mb-8">{children}</div>

      {(onBack || onNext) && !hideNext ? (
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={!onBack}>
            Back
          </Button>
          <Button type="button" onClick={onNext} disabled={nextDisabled || isLoading}>
            {isLoading ? 'Please wait…' : nextLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
