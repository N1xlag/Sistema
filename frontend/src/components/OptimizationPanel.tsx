import React from 'react';
import { OptimalResourcesResult } from '@/types';

interface Props {
    data: OptimalResourcesResult;
}

export default function OptimizationPanel({ data }: Props) {
    return (
        <div className="animate-fade-in space-y-6 pb-8 w-full">
            <div className="card bg-[var(--bg-card)] border-l-4 border-blue-500 shadow-lg p-6 rounded-xl">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                            <span>📋</span> Requisición de Equipos (JIT)
                        </h2>
                        <p className="text-[var(--text-muted)] text-sm">
                            El sistema ha <strong className="text-blue-500">auto-ajustado</strong> el panel principal para fabricar {data.targetPots} macetas en {data.timeLimit} horas.
                        </p>
                    </div>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 mb-8 flex items-start gap-3">
                    <div className="text-2xl mt-1">🧠</div>
                    <div>
                        <strong className="text-blue-600 dark:text-blue-400 block mb-1">Estrategia de Trabajo Simultáneo:</strong>
                        <p className="text-sm text-[var(--text-primary)]">
                            Se asume que mientras un lote seca (5 min), el operario pesa y mezcla el siguiente (3 min). 
                            Bajo esta eficiencia, <strong>cada estación saca {data.time.potsPerCycle} macetas cada {data.time.cycleMin} minutos</strong> (15 macetas/hora).
                        </p>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
                    📦 Equipos Físicos Despachados a Planta
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-xl border border-[var(--border-light)] text-center shadow-sm hover:border-blue-500 transition-colors">
                        <div className="text-4xl mb-3">🧱</div>
                        <div className="text-4xl font-black text-blue-500">{data.tools.molds}</div>
                        <div className="text-sm font-bold text-[var(--text-muted)] mt-2">Moldes Base</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-xl border border-[var(--border-light)] text-center shadow-sm hover:border-indigo-500 transition-colors">
                        <div className="text-4xl mb-3">🥣</div>
                        <div className="text-4xl font-black text-indigo-500">{data.tools.bowls}</div>
                        <div className="text-sm font-bold text-[var(--text-muted)] mt-2">Bowls de Mezcla</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-xl border border-[var(--border-light)] text-center shadow-sm hover:border-emerald-500 transition-colors">
                        <div className="text-4xl mb-3">⚖️</div>
                        <div className="text-4xl font-black text-emerald-500">{data.tools.scales}</div>
                        <div className="text-sm font-bold text-[var(--text-muted)] mt-2">Balanzas Grameras</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] p-5 rounded-xl border border-amber-500/50 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-bl-lg">DINÁMICO</div>
                        <div className="text-4xl mb-3">⚙️</div>
                        <div className="text-4xl font-black text-amber-500 drop-shadow-md">{data.tools.grinders}</div>
                        <div className="text-sm font-bold text-[var(--text-muted)] mt-2">Molinos Calculados</div>
                    </div>
                </div>

                <div className="mt-6 p-5 bg-green-500/10 border border-green-500/30 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">Proyección de Terminado</div>
                        <div className="text-sm text-[var(--text-muted)] mt-1">
                            Trabajando con <strong>{data.tools.stations} mesa(s) de trabajo</strong> en paralelo.
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-green-500">{data.time.realHours} horas</div>
                    </div>
                </div>

            </div>
        </div>
    );
}