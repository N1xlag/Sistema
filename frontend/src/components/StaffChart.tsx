'use client';

import { StaffAllocation, BreakdownItem } from '@/types';

interface StaffChartProps {
    allocation: StaffAllocation;
    totalStaff: number;
    timeline?: {
        production: number; // minutos
        totalHours: string;
    };
    efficiency?: {
        potsPerHour: string;
        potsPerPerson: string;
    };
    targetPots?: number;
    detailedBreakdown?: BreakdownItem[];
}

const stationEmojis: Record<string, string> = {
    molienda: '⚙️',
    dosificacion: '⚖️',
    mezclado: '🔄',
    moldeado: '🏺',
    horneado: '🔥',
    control: '✅'
};

const stationColors: Record<string, string> = {
    molienda: '#22c55e',
    dosificacion: '#10b981',
    mezclado: '#059669',
    moldeado: '#047857',
    horneado: '#f59e0b',
    control: '#3b82f6'
};

// Explicaciones de por qué cada estación necesita esa proporción de personal
const stationExplanations: Record<string, { role: string; reason: string }> = {
    molienda: {
        role: 'Trituración de cáscaras',
        reason: 'Trabajo mecánico con maquinaria. Requiere 1-2 operadores para alimentar la trituradora y supervisar el proceso.'
    },
    dosificacion: {
        role: 'Pesaje y medición',
        reason: 'Tarea de precisión. Se necesita 1 persona para pesar y medir las proporciones exactas según la regla 10:1.'
    },
    mezclado: {
        role: 'Mezcla de ingredientes',
        reason: 'Proceso continuo. Requiere 2-3 personas para mezclar manualmente la pasta mientras se mantiene la consistencia.'
    },
    moldeado: {
        role: 'Formado de macetas',
        reason: 'CUELLO DE BOTELLA: Es el proceso más lento y manual. Se concentra el mayor personal aquí para maximizar producción.'
    },
    horneado: {
        role: 'Deshidratación',
        reason: 'Supervisión del horno. Solo requiere monitoreo periódico de temperatura y el volteo a las 2 horas.'
    },
    control: {
        role: 'Control de calidad',
        reason: 'Inspección final. 1 persona revisa defectos, dureza y acabado antes de aprobar cada maceta.'
    }
};

export default function StaffChart({ allocation, totalStaff, timeline, efficiency, targetPots, detailedBreakdown }: StaffChartProps) {
    const entries = Object.entries(allocation);
    const maxStaff = Math.max(...entries.map(([, data]) => data.staff));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Stats */}
            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                <div className="card-stat">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{totalStaff}</div>
                    <div className="stat-label">Personal Total</div>
                </div>
                <div className="card-stat">
                    <div className="stat-icon">🏭</div>
                    <div className="stat-value">{entries.length}</div>
                    <div className="stat-label">Estaciones</div>
                </div>
                <div className="card-stat">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-value">{maxStaff}</div>
                    <div className="stat-label">Máx. por Estación</div>
                </div>
            </div>

            {/* Bar Chart with Explanations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {entries.map(([station, data], index) => {
                    const percentage = (data.staff / totalStaff) * 100;
                    const color = stationColors[station] || '#22c55e';
                    const explanation = stationExplanations[station];
                    const isCritical = station === 'moldeado';

                    return (
                        <div
                            key={station}
                            className={`rounded-xl border animate-fade-in ${isCritical
                                    ? 'bg-amber-500/5 border-amber-500/30'
                                    : 'bg-[var(--bg-tertiary)] border-[var(--border-light)]'
                                }`}
                            style={{ padding: '1.5rem', animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{stationEmojis[station] || '📦'}</span>
                                        <span className="font-bold capitalize text-[var(--text-primary)]">
                                            {station}
                                        </span>
                                        {isCritical && (
                                            <span className="badge badge-warning text-xs">CUELLO DE BOTELLA</span>
                                        )}
                                    </div>
                                    {explanation && (
                                        <p className="text-xs text-[var(--text-muted)] ml-8">
                                            {explanation.role}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold" style={{ color }}>
                                        {data.staff}
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">
                                        {data.percentage} del equipo
                                    </div>
                                </div>
                            </div>

                            <div className="progress-bar mb-4">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`
                                    }}
                                />
                            </div>

                            {/* Justificación */}
                            {explanation && (
                                <div className="flex items-start gap-3 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                                    <span className="text-blue-500 flex-shrink-0">💡</span>
                                    <span className="leading-relaxed">{explanation.reason}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Metodología y Cálculos */}
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1.5rem' }}>
                <div className="card">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>📚</span>
                        Metodología de Asignación
                    </h4>
                    <div className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p className="text-[var(--text-muted)]">
                            La distribución del personal maximiza el flujo en estaciones críticas:
                        </p>
                        <ul className="space-y-2 text-[var(--text-muted)] pl-4 list-disc">
                            <li><strong>Moldeado (30%)</strong>: Determina la velocidad.</li>
                            <li><strong>Mezclado (25%)</strong>: Alimentación continua.</li>
                            <li><strong>Molienda (15%)</strong>: Preparación inicial.</li>
                        </ul>
                    </div>
                </div>

                {timeline && detailedBreakdown && (
                    <div className="card border-blue-500/30 bg-blue-500/5">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-400">
                            <span>⏱️</span>
                            Análisis Temporal Detallado ({totalStaff <= 3 ? "Secuencial" : "Paralelo"})
                        </h4>

                        <div className="space-y-3">
                            {/* Preparación */}
                            <div className="flex justify-between items-center text-sm p-2 rounded bg-blue-500/10 border-l-4 border-blue-500">
                                <span>🔥 Precalentado y Setup</span>
                                <span className="font-mono font-bold">30 min</span>
                            </div>

                            {/* Bloque de Producción */}
                            <div className={`p-3 rounded border ${totalStaff <= 3 ? 'border-dashed border-amber-500/30 bg-amber-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                                <div className="text-xs font-bold uppercase mb-2 tracking-wide flex justify-between">
                                    <span>Fase de Producción ({targetPots} macetas)</span>
                                    <span>{(timeline.production).toFixed(0)} min total</span>
                                </div>

                                {totalStaff <= 3 ? (
                                    // Visualización secuencial
                                    <div className="space-y-1">
                                        {detailedBreakdown.map((item) => (
                                            <div key={item.station} className="flex justify-between text-xs text-[var(--text-muted)] pl-2 border-l-2 border-amber-500/20">
                                                <span className="capitalize">{item.station} ({item.staff} pers)</span>
                                                <span className="font-mono">{Math.ceil(item.minutes)} min</span>
                                            </div>
                                        ))}
                                        <div className="text-xs text-right pt-1 text-amber-500 font-bold border-t border-amber-500/20 mt-1">
                                            Suma directa (Sin paralelismo)
                                        </div>
                                    </div>
                                ) : (
                                    // Visualización paralela
                                    <div className="space-y-1">
                                        <div className="text-xs text-[var(--text-muted)] mb-1">Actividades simultáneas:</div>
                                        {detailedBreakdown.map((item) => {
                                            const isBottleneck = item.station === 'moldeado';
                                            return (
                                                <div key={item.station} className={`flex justify-between text-xs pl-2 border-l-2 ${isBottleneck ? 'border-red-500 font-bold text-red-400' : 'border-green-500/20 text-[var(--text-muted)]'}`}>
                                                    <span className="capitalize w-1/3">{item.station}</span>
                                                    <span className="w-1/3 text-center">{item.staff} pers.</span>
                                                    <span className="font-mono w-1/3 text-right">~{Math.ceil(item.minutes)} min</span>
                                                </div>
                                            );
                                        })}
                                        <div className="text-xs text-right pt-1 text-green-500 font-bold border-t border-green-500/20 mt-1">
                                            Rige el tiempo más alto (Bottleneck) + 10% coord.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Horneado */}
                            <div className="flex justify-between items-center text-sm p-2 rounded bg-amber-500/10 border-l-4 border-amber-500">
                                <span>⏲️ Horneado (No depende de staff)</span>
                                <span className="font-mono font-bold">240 min</span>
                            </div>

                            <div className="pt-2 mt-2 border-t border-blue-500/20 flex justify-between items-center font-bold">
                                <span>TIEMPO TOTAL DEL CICLO</span>
                                <span className="text-xl text-blue-400">{timeline.totalHours}h</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
