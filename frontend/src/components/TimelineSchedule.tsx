'use client';

import { RotationSchedule } from '@/types';

interface TimelineScheduleProps {
    schedule: RotationSchedule;
}

export default function TimelineSchedule({ schedule }: TimelineScheduleProps) {
    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
        }
        return `${mins}m`;
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>⏱️</span>
                    Cronograma de Rotación
                </h3>
                <span className="badge badge-info">{schedule.totalTime}</span>
            </div>

            <div className="timeline">
                {schedule.phases.map((phase, index) => (
                    <div
                        key={index}
                        className={`timeline-item ${phase.critical ? 'critical' : ''}`}
                    >
                        <div className="timeline-dot" />
                        <div className="timeline-content animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-semibold ${phase.critical ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                                    {phase.action}
                                </h4>
                                <span className="text-sm font-mono text-[var(--text-muted)]">
                                    {formatTime(phase.minute)}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">
                                {phase.details}
                            </p>
                            {phase.critical && (
                                <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-xs text-amber-500 font-semibold">
                                        ⚠️ PUNTO CRÍTICO: Acción requerida
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                <div className="flex items-center gap-2 mb-2">
                    <span>💡</span>
                    <span className="font-semibold text-sm">Recordatorio</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                    El volteo a los 120 minutos es <strong>obligatorio</strong> para garantizar un secado uniforme
                    y evitar la aparición de líquido rosa residual.
                </p>
            </div>
        </div>
    );
}
