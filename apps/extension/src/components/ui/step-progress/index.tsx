import React, { useMemo } from 'react'
import { cn } from 'utils/cn'

type StepProgressProps = {
  currentStep: number
  totalSteps: number
  className?: string
  moveToStep?: (step: number) => void
}

const StepProgress = ({ currentStep, totalSteps, className, moveToStep }: StepProgressProps) => {
  const steps = useMemo(
    () => Array.from({ length: totalSteps }, (_, index) => index + 1),
    [totalSteps],
  )

  return (
    <div className={cn('flex flex-row items-center justify-center align-center gap-3', className)}>
      {steps.map((step) => (
        <div
          key={step}
          onClick={() => moveToStep?.(step)}
          className={cn(
            'h-1 w-[1.125rem] rounded-full transition-colors duration-500',
            step === currentStep ? 'bg-accent-green' : 'bg-secondary-300',
          )}
        />
      ))}
    </div>
  )
}

export default StepProgress
