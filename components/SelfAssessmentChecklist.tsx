'use client';

import { useState, useEffect } from 'react';

interface SelfAssessmentChecklistProps {
    scenarioId: string;
    items: string[];
    title?: string;
}

export default function SelfAssessmentChecklist({
    scenarioId,
    items,
    title = "Self-Assessment Checklist"
}: SelfAssessmentChecklistProps) {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`checklist-${scenarioId}`);
        if (saved) {
            setCheckedItems(new Set(JSON.parse(saved)));
        }
    }, [scenarioId]);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem(`checklist-${scenarioId}`, JSON.stringify(Array.from(checkedItems)));
    }, [checkedItems, scenarioId]);

    const toggleItem = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);
    };

    const handleReset = () => {
        setCheckedItems(new Set());
        localStorage.removeItem(`checklist-${scenarioId}`);
    };

    const progress = (checkedItems.size / items.length) * 100;

    return (
        <div className="self-assessment-container">
            <div className="self-assessment-header">
                <h3>✅ {title}</h3>
                <button onClick={handleReset} className="reset-btn">Reset</button>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-text">{checkedItems.size} / {items.length} completed ({Math.round(progress)}%)</div>
            </div>

            <div className="checklist-items">
                {items.map((item, index) => (
                    <label key={index} className="checklist-item">
                        <input
                            type="checkbox"
                            checked={checkedItems.has(index)}
                            onChange={() => toggleItem(index)}
                            className="checklist-checkbox"
                        />
                        <span className="checklist-text">{item}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
