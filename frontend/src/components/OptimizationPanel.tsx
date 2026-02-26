import React from 'react';
import { OptimalResourcesResult, SimulationParams } from '@/types';

interface Props {
    data: OptimalResourcesResult;
    params: SimulationParams;
    onApply?: () => void; // <--- Agregamos esto
}

export default function OptimizationPanel({ data, params, onApply }: Props) {
    if (!data) return null;

    // CÁLCULO LIVE: Molienda reactiva a los sliders
    const totalGrams = (params.targetPots || 0) * 168;
    const grindRate = (params.grindGrams || 4800) / (params.grindMins || 45);
    const capacity = grindRate * ((params.hoursAvailable || 0) * 60);
    const liveGrinders = Math.max(1, Math.ceil(totalGrams / (capacity || 1)));

    const liveTotalStaff = liveGrinders + 1 + (data.tools.bowls || 1) + 1;

    return (
        <div className="animate-fade-in space-y-6 pb-8 w-full">
            <div className="card bg-[var(--bg-card)] border-l-4 border-emerald-500 shadow-lg p-6 rounded-xl relative">
                
                {/* NUEVO BOTÓN APLICAR */}
                {onApply && (
                    <button 
                        onClick={onApply}
                        className="absolute top-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors flex items-center gap-2 text-sm z-10"
                    >
                        <span>✨</span> Aplicar Sugerencia
                    </button>
                )}

                <div className="mb-6 pr-40"> {/* pr-40 evita que el texto choque con el botón */}
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                        <span>📦</span> Requisición de Equipos Físicos
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm">
                        Sugerencia ideal: <strong className="text-indigo-500">{liveTotalStaff} Operarios</strong> y <strong className="text-emerald-500">{data.tools.molds} Moldes</strong>. Presiona "Aplicar" para enviar estos valores al panel de control.
                    </p>
                </div>

                {/* GRILLA DE EQUIPOS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-2xl border border-[var(--border-light)] text-center shadow-sm">
                        <div className="text-4xl mb-3">🧱</div>
                        <div className="text-3xl font-black text-emerald-500">{data.tools.molds}</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Moldes Totales</div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-2xl border border-[var(--border-light)] text-center shadow-sm">
                        <div className="text-4xl mb-3">🥣</div>
                        <div className="text-3xl font-black text-indigo-500">{data.tools.bowls}</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Bowls de Mezcla</div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-2xl border border-[var(--border-light)] text-center shadow-sm">
                        <div className="text-4xl mb-3">⚖️</div>
                        <div className="text-3xl font-black text-blue-500">{data.tools.scales}</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Balanzas Grameras</div>
                    </div>

                    {/* MOLINOS LIVE */}
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-2xl border border-amber-500/30 text-center shadow-sm relative overflow-hidden transition-all">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-2 py-1 rounded-bl-lg">LIVE</div>
                        <div className="text-4xl mb-3">⚙️</div>
                        <div className="text-3xl font-black text-amber-500">{liveGrinders}</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Molinos Requeridos</div>
                    </div>
                </div>

                {/* TIEMPO ESTIMADO DE PRODUCCIÓN (Simplificado) */}
                <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">⏱️</div>
                        <div>
                            <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">Tiempo Estimado de Producción:</div>
                            <p className="text-sm text-[var(--text-primary)]">Calculado para un flujo continuo de {data.targetPots} unidades.</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="text-4xl font-black text-blue-500">{data.time.realHours}h</div>
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Lead Time (Arranque + Ciclo)</div>
                    </div>
                </div>

            </div>
        </div>
    );
}