'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
    durationMinutes?: number;
    scenarioId: string;
}

export default function Timer({ durationMinutes = 30, scenarioId }: TimerProps) {
    // Initialize with full duration to match server-side rendering
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load saved state from localStorage ONLY after mount
    useEffect(() => {
        setIsMounted(true);
        const savedState = localStorage.getItem(`timer-${scenarioId}`);
        if (savedState) {
            try {
                const { timeLeft: savedTime, isRunning: savedRunning, timestamp } = JSON.parse(savedState);

                // Calculate elapsed time if it was running
                if (savedRunning) {
                    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
                    const newTimeLeft = Math.max(0, savedTime - elapsed);
                    setTimeLeft(newTimeLeft);
                    setIsRunning(true); // Auto-resume if it was running
                    if (newTimeLeft === 0) setIsComplete(true);
                } else {
                    setTimeLeft(savedTime);
                    setIsRunning(false);
                    setIsComplete(savedTime === 0);
                }
            } catch (e) {
                console.error("Failed to parse timer state", e);
            }
        }
    }, [scenarioId]);

    // Save state to localStorage whenever state changes
    useEffect(() => {
        if (!isMounted) return;

        // Don't save if complete and reset
        if (timeLeft === durationMinutes * 60 && !isRunning && !isComplete) {
            // access localstorage only if we intend to clear it or it exists
            if (localStorage.getItem(`timer-${scenarioId}`)) {
                localStorage.removeItem(`timer-${scenarioId}`);
            }
            return;
        }

        localStorage.setItem(`timer-${scenarioId}`, JSON.stringify({
            timeLeft,
            isRunning,
            timestamp: Date.now()
        }));
    }, [timeLeft, isRunning, scenarioId, isMounted, durationMinutes, isComplete]);

    // Timer countdown logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsComplete(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(durationMinutes * 60);
        setIsComplete(false);
        localStorage.removeItem(`timer-${scenarioId}`);
    };

    const progress = ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100;
    const isWarning = timeLeft <= 300 && timeLeft > 60; // 5 minutes or less
    const isCritical = timeLeft <= 60 && timeLeft > 0; // 1 minute or less

    // Determine display time - prefer client state if mounted
    const displayTime = formatTime(timeLeft);

    return (
        <div className="timer-container">
            <div className="timer-header">
                <h3>⏱️ Practice Timer</h3>
                <p className="timer-subtitle">Simulate real interview time pressure</p>
            </div>

            <div className={`timer-display ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''} ${isComplete ? 'complete' : ''}`}>
                <div className="timer-time">{displayTime}</div>
                <div className="timer-label">
                    {isComplete ? 'Time\'s up!' : isRunning ? 'Running' : 'Paused'}
                </div>
            </div>

            <div className="timer-progress-bar">
                <div
                    className="timer-progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="timer-controls">
                {!isRunning && !isComplete && (
                    <button onClick={handleStart} className="timer-btn timer-btn-start">
                        {timeLeft === durationMinutes * 60 ? 'Start Timer' : 'Resume'}
                    </button>
                )}
                {isRunning && (
                    <button onClick={handlePause} className="timer-btn timer-btn-pause">
                        Pause
                    </button>
                )}
                <button onClick={handleReset} className="timer-btn timer-btn-reset">
                    Reset
                </button>
            </div>

            {isComplete && (
                <div className="timer-completion-message">
                    🎉 Great job! Review your approach and compare with the answers below.
                </div>
            )}
        </div>
    );
}
