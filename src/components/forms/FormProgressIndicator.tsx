import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormStep {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface FormProgressIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const FormProgressIndicator = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: FormProgressIndicatorProps) => {
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const isStepCurrent = (stepIndex: number) => currentStep === stepIndex;

  return (
    <div className={cn(
      "sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50",
      "shadow-sm",
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completed = isStepCompleted(index);
            const current = isStepCurrent(index);
            const clickable = onStepClick && (completed || current);

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Item */}
                <div className="flex flex-col items-center w-full">
                  <button
                    onClick={() => clickable && onStepClick(index)}
                    disabled={!clickable}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full",
                      "transition-all duration-300",
                      "group",
                      clickable && "cursor-pointer",
                      !clickable && "cursor-default",
                      completed && "bg-green-500 dark:bg-green-600 text-white",
                      current && !completed && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !completed && !current && "bg-muted text-muted-foreground",
                      clickable && "hover:scale-110"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Icon className={cn(
                        "w-4 h-4 md:w-5 md:h-5",
                        current && "animate-pulse"
                      )} />
                    )}

                    {/* Tooltip on hover - Desktop only */}
                    {step.description && (
                      <div className={cn(
                        "hidden md:block absolute -bottom-12 left-1/2 -translate-x-1/2",
                        "bg-popover text-popover-foreground",
                        "px-3 py-1.5 rounded-md shadow-lg",
                        "text-xs whitespace-nowrap",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200",
                        "pointer-events-none z-50"
                      )}>
                        {step.description}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-popover" />
                      </div>
                    )}
                  </button>

                  {/* Step Label - Hidden on mobile, shown on md+ */}
                  <span className={cn(
                    "hidden md:block mt-2 text-xs font-medium text-center",
                    "transition-colors duration-300",
                    completed && "text-green-600 dark:text-green-400",
                    current && !completed && "text-primary font-semibold",
                    !completed && !current && "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 md:mx-2 relative">
                    {/* Background line */}
                    <div className="absolute inset-0 bg-muted" />

                    {/* Progress line */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 origin-left",
                        completed ? "bg-green-500 dark:bg-green-600" : "bg-muted"
                      )}
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: completed ? 1 : (current ? 0.5 : 0)
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Label - Mobile only */}
        <div className="md:hidden mt-3 text-center">
          <p className="text-sm font-semibold text-foreground">
            {steps[currentStep]?.label}
          </p>
          {steps[currentStep]?.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        {/* Progress Percentage */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="flex-1 max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-green-500"
              initial={{ width: "0%" }}
              animate={{
                width: `${(completedSteps.length / steps.length) * 100}%`
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-right">
            {Math.round((completedSteps.length / steps.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar o progresso do formulário
 */
export const useFormProgress = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepIndex)) {
        return [...prev, stepIndex].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const markStepIncomplete = (stepIndex: number) => {
    setCompletedSteps(prev => prev.filter(s => s !== stepIndex));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      markStepCompleted(currentStep);
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetProgress = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return {
    currentStep,
    completedSteps,
    markStepCompleted,
    markStepIncomplete,
    goToStep,
    nextStep,
    previousStep,
    resetProgress,
    isLastStep,
    isFirstStep,
    progress: (completedSteps.length / totalSteps) * 100,
  };
};
