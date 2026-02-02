'use client';

import { DosageResult } from '@/types';
import { PRODUCTION_CONSTANTS } from '@/types';

interface DosageCardProps {
    dosage: DosageResult;
    targetPots: number;
}

export default function DosageCard({ dosage, targetPots }: DosageCardProps) {
    const { RATIO } = PRODUCTION_CONSTANTS;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Regla de Oro */}
            <div className="card glow-box animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                        ⚗️
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">Regla de Oro</h3>
                        <p className="text-sm text-[var(--text-muted)]">Proporción óptima validada</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 p-4 rounded-lg bg-[var(--bg-tertiary)]" style={{ gap: '1rem' }}>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gradient">{RATIO.EGGSHELL_GRAMS}g</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Cáscara</div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="text-2xl">:</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gradient">{RATIO.ALGINATE_GRAMS}g</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Alginato</div>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <span className={`badge ${dosage.ratio.isValid ? 'badge-success' : 'badge-error'}`}>
                        {dosage.ratio.isValid ? '✓ Ratio válido' : '✗ Ratio inválido'}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">{dosage.ratio.description}</span>
                </div>
            </div>

            {/* Insumos Requeridos */}
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1rem' }}>
                <div className="card-stat animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="stat-icon">🥚</div>
                    <div className="stat-value">{dosage.inputs.eggshell.kg}</div>
                    <div className="stat-label">kg Cáscara</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                        {dosage.inputs.eggshell.grams}g total
                    </div>
                </div>

                <div className="card-stat animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="stat-icon">🧪</div>
                    <div className="stat-value">{dosage.inputs.alginate.bags}</div>
                    <div className="stat-label">Bolsas Alginato</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                        {dosage.inputs.alginate.grams}g total
                    </div>
                </div>

                <div className="card-stat animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="stat-icon">💧</div>
                    <div className="stat-value">{dosage.inputs.water.liters}</div>
                    <div className="stat-label">Litros Agua</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                        {dosage.inputs.water.ml}ml total
                    </div>
                </div>

                <div className="card-stat animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <div className="stat-icon">🛢️</div>
                    <div className="stat-value">{dosage.inputs.oil.liters}</div>
                    <div className="stat-label">Litros Aceite</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                        Desmoldante
                    </div>
                </div>
            </div>

            {/* Estimaciones */}
            <div className="card animate-fade-in" style={{ animationDelay: '500ms' }}>
                <h4 className="font-bold text-lg flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                    <span>📊</span>
                    Estimaciones de Producción
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1rem' }}>
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                        <div className="text-2xl font-bold text-green-500 mb-2">
                            {dosage.estimates.functionalUnits}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] leading-tight">
                            Unidades Funcionales
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                        <div className="text-2xl font-bold text-amber-500 mb-2">
                            {dosage.estimates.defectUnits}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] leading-tight">
                            Posibles Defectos
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                        <div className="text-2xl font-bold text-blue-500 mb-2">
                            {dosage.estimates.wasteGrams}g
                        </div>
                        <div className="text-xs text-[var(--text-muted)] leading-tight">
                            Merma Estimada
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                        <div className="text-2xl font-bold text-purple-500 mb-2">
                            {dosage.estimates.totalCostBs} Bs
                        </div>
                        <div className="text-xs text-[var(--text-muted)] leading-tight">
                            Costo Total
                        </div>
                    </div>
                </div>

                <div className="divider" />

                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Costo por unidad:</span>
                    <span className="text-xl font-bold text-gradient">
                        {dosage.estimates.costPerUnit} Bs/maceta
                    </span>
                </div>
            </div>

            {/* Alertas */}
            {dosage.alerts.length > 0 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', animationDelay: '600ms' }}>
                    {dosage.alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`badge badge-${alert.type} w-full justify-start py-3 px-4`}
                        >
                            {alert.type === 'error' ? '⛔' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                            <span className="ml-2">{alert.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
