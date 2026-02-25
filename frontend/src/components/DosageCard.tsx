'use client';

import { useState } from 'react';
import { DosageResult } from '@/types';

interface DosageCardProps {
    dosage: DosageResult;
    targetPots: number;
}

export default function DosageCard({ dosage, targetPots }: DosageCardProps) {
    // 1. Empezamos en tu escenario eficiente por defecto: 5 minutos
    const [dryingTime, setDryingTime] = useState<number | string>(5);

    // 2. Extrapolación Matemática: Adivina la receta para cualquier tiempo libre
    const getDynamicRecipe = (t: number) => {
        // Fórmula de la recta entre dos puntos
        const interpolate = (x: number, x0: number, x1: number, y0: number, y1: number) => 
            y0 + (y1 - y0) * ((x - x0) / (x1 - x0));

        let egg, alg, water;

        if (t <= 8) {
            // Usamos la pendiente del escenario 5m al 8m (funciona para números menores a 5 también)
            egg = interpolate(t, 5, 8, 168, 175);
            alg = interpolate(t, 5, 8, 18, 18.5);
            water = interpolate(t, 5, 8, 140, 146);
        } else {
            // Usamos la pendiente del escenario 8m al 10m (funciona para 20m, 30m, etc.)
            egg = interpolate(t, 8, 10, 175, 180);
            alg = interpolate(t, 8, 10, 18.5, 19);
            water = interpolate(t, 8, 10, 146, 150);
        }

        // Evitar números negativos si ponen un tiempo ilógicamente bajo
        return {
            egg: Math.max(0, Number(egg.toFixed(1))),
            alg: Math.max(0, Number(alg.toFixed(1))),
            water: Math.max(0, Math.round(water))
        };
    };

    const tNumber = Number(dryingTime) || 5;
    const dynamicRecipe = getDynamicRecipe(tNumber);

    // 3. RECALCULAMOS LOS TOTALES DE LA PLANTA EN VIVO
    // Ignoramos los del backend y usamos la fórmula multiplicada por la meta
    const totalEggKg = ((dynamicRecipe.egg * targetPots) / 1000).toFixed(2);
    const totalAlgBags = Math.ceil((dynamicRecipe.alg * targetPots) / 454);
    const totalWaterLiters = ((dynamicRecipe.water * targetPots) / 1000).toFixed(2);
    const totalColorantMl = targetPots * 2;   // 2ml por maceta
    const totalVarnishMl = targetPots * 10;   // 10ml por maceta

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* CALCULADORA LIBRE EN TIEMPO REAL */}
            <div className="card border-blue-500 shadow-lg animate-fade-in">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                            ⏱️
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--text-primary)]">Secado y Formulación (1 ud)</h3>
                            <p className="text-sm text-[var(--text-muted)]">Modifica el tiempo y los materiales totales se ajustarán</p>
                        </div>
                    </div>

                    {/* Input libre para el usuario */}
                    <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-light)]">
                        <span className="text-sm font-bold text-[var(--text-muted)]">Tiempo (min):</span>
                        <input 
                            type="number" 
                            value={dryingTime}
                            onChange={(e) => setDryingTime(e.target.value)}
                            className="w-20 bg-[var(--bg-card)] border border-[var(--border-medium)] rounded px-2 py-1 text-center font-bold text-blue-500 outline-none"
                            min="1"
                            max="60"
                        />
                    </div>
                </div>

                <div className="mb-6 px-2">
                    <input 
                        type="range" 
                        min="2" 
                        max="20" 
                        step="0.5" 
                        value={tNumber}
                        onChange={(e) => setDryingTime(Number(e.target.value))}
                        className="w-full accent-blue-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs font-bold mt-2 text-[var(--text-muted)]">
                        <span>Ultra Rápido (2m)</span>
                        <span className="text-blue-500">Normal (5m)</span>
                        <span>Lento (20m+)</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg text-center border border-[var(--border-light)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">{dynamicRecipe.egg}g</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Harina de Huevo</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg text-center border border-[var(--border-light)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">{dynamicRecipe.alg}g</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Alginato</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] p-3 rounded-lg text-center border border-[var(--border-light)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">{dynamicRecipe.water}ml</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">Agua</div>
                    </div>
                </div>
            </div>

            {/* Insumos Requeridos TOTALES DINÁMICOS */}
            <div className="card glow-box animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📦</span> Material Total para {targetPots} macetas
                    {tNumber !== 5 && (
                        <span className="badge badge-info ml-auto text-xs animate-pulse">Calculado a {tNumber} min</span>
                    )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                        <div className="stat-icon">🥚</div>
                        <div className="stat-value">{totalEggKg}</div>
                        <div className="stat-label">kg Cáscara</div>
                    </div>
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                        <div className="stat-icon">🧪</div>
                        <div className="stat-value">{totalAlgBags}</div>
                        <div className="stat-label">Bolsas Alginato</div>
                    </div>
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                        <div className="stat-icon">💧</div>
                        <div className="stat-value">{totalWaterLiters}</div>
                        <div className="stat-label">Litros Agua</div>
                    </div>
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
                        <div className="stat-icon">🛢️</div>
                        <div className="stat-value">{dosage.inputs.oil.liters}</div>
                        <div className="stat-label">Litros Aceite</div>
                    </div>
                    {/* LOS NUEVOS MATERIALES */}
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-green-500/30">
                        <div className="stat-icon">🍃</div>
                        <div className="stat-value">{totalColorantMl} ml</div>
                        <div className="stat-label">Colorante Vegetal</div>
                    </div>
                    <div className="card-stat bg-[var(--bg-tertiary)] border border-amber-500/30">
                        <div className="stat-icon">✨</div>
                        <div className="stat-value">{totalVarnishMl} ml</div>
                        <div className="stat-label">Barniz Natural</div>
                    </div>
                </div>
            </div>

            {/* Estimaciones de Costo */}
            <div className="card animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Costo total de esta producción (Bs):</span>
                    <span className="text-2xl font-bold text-gradient">
                        {dosage.estimates.totalCostBs} Bs
                    </span>
                </div>
            </div>
        </div>
    );
}