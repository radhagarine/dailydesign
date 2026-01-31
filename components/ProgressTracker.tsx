'use client';

import { useState } from 'react';

interface Step {
    id: string;
    label: string;
    icon: string;
}

interface ProgressTrackerProps {
    steps?: Step[];
}

const defaultSteps: Step[] = [
    { id: 'components', label: 'System Components', icon: '🏗️' },
    { id: 'data', label: 'Data Modeling', icon: '📊' },
    { id: 'apis', label: 'API Design', icon: '🔌' },
    { id: 'scaling', label: 'Scaling Strategy', icon: '📈' }
];

export default function ProgressTracker({ steps = defaultSteps }: ProgressTrackerProps) {
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    const toggleStep = (stepId: string) => {
        const newCompleted = new Set(completedSteps);
        if (newCompleted.has(stepId)) {
            newCompleted.delete(stepId);
        } else {
            newCompleted.add(stepId);
        }
        setCompletedSteps(newCompleted);
    };

    return (
        <div className="progress-tracker">
            <h3 className="progress-tracker-title">📝 Design Framework</h3>
            <p className="progress-tracker-subtitle">Work through each step systematically</p>

            <div className="progress-steps">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="progress-step-wrapper">
                            <button
                                className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                onClick={() => {
                                    setCurrentStep(step.id);
                                    if (!isCompleted) {
                                        toggleStep(step.id);
                                    }
                                }}
                            >
                                <div className="progress-step-icon">
                                    {isCompleted ? '✓' : step.icon}
                                </div>
                                <div className="progress-step-label">{step.label}</div>
                                <div className="progress-step-number">{index + 1}</div>
                            </button>

                            {index < steps.length - 1 && (
                                <div className={`progress-connector ${isCompleted ? 'completed' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
