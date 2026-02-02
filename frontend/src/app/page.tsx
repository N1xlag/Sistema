"use client";

import { useState, useEffect, useCallback } from "react";
import { FullSimulationResult, SimulationParams, PRODUCTION_CONSTANTS } from "@/types";
import { runFullSimulation, checkHealth } from "@/lib/api";
import TrayVisualizer from "@/components/TrayVisualizer";
import TimelineSchedule from "@/components/TimelineSchedule";
import StaffChart from "@/components/StaffChart";
import DosageCard from "@/components/DosageCard";
import AlertsPanel from "@/components/AlertsPanel";

type TabType = "overview" | "dosage" | "staff" | "tray";

export default function Home() {
  // Estados
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);

  // Parámetros de simulación
  const [params, setParams] = useState<SimulationParams>({
    targetPots: 21,
    hoursAvailable: 8,
    staffCount: 11,
    maximizeTrays: false,
    traysAvailable: 4,
  });

  // Resultado de simulación
  const [result, setResult] = useState<FullSimulationResult | null>(null);

  // Verificar estado del API
  useEffect(() => {
    checkHealth().then(setApiStatus);
  }, []);

  // Toggle tema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Ejecutar simulación
  const handleSimulate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await runFullSimulation(params);
      setResult(data);
    } catch (error) {
      console.error("Error en simulación:", error);
    }
    setLoading(false);
  }, [params]);

  // Tabs
  const tabs = [
    { id: "overview", label: "Resumen", icon: "📊" },
    { id: "dosage", label: "Dosificación", icon: "🧪" },
    { id: "staff", label: "Personal", icon: "👥" },
    { id: "tray", label: "Deshidratador", icon: "🔥" },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo mb-8">
          <div className="logo-icon">🌱</div>
          <div>
            <div className="logo-text">EcoLlajta</div>
            <div className="text-xs text-[var(--text-muted)]">Smart-Twin v1.0</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">
            Módulos
          </div>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
        </nav>

        {/* Constantes */}
        <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Constantes del Sistema
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Relación</span>
              <span className="font-semibold">10:1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Costo/ud</span>
              <span className="font-semibold">{PRODUCTION_CONSTANTS.PERFORMANCE.COST_PER_UNIT_BS} Bs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Horneado</span>
              <span className="font-semibold">4-5h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Dimensión</span>
              <span className="font-semibold">5 × 8</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-6">
          <div
            className={`status-indicator ${apiStatus ? "online" : "offline"}`}
          >
            <div className="status-dot" />
            <span>{apiStatus ? "API Conectada" : "API Desconectada"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              className="btn-ghost lg:hidden mb-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              <span className="text-gradient">Simulador de Producción</span>
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Herramienta de optimización para macetas biodegradables • UMSS 2026
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-secondary"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </header>

        {/* Control Panel */}
        <div className="card mb-12 animate-fade-in" style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl">
              🎛️
            </div>
            <div>
              <h2 className="font-bold text-lg">Panel de Control</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Ajusta los parámetros y ejecuta la simulación
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" style={{ gap: '2rem' }}>
            {/* Target Pots */}
            <div className="input-group">
              <label className="input-label">
                🏺 Meta de Producción (macetas)
              </label>
              <input
                type="number"
                value={params.targetPots || 1}
                onChange={(e) =>
                  setParams({ ...params, targetPots: Number(e.target.value) })
                }
                className="input-field"
                min={1}
                max={1000000}
              />
              <input
                type="range"
                value={params.targetPots || 1}
                onChange={(e) =>
                  setParams({ ...params, targetPots: Number(e.target.value) })
                }
                className="input-range"
                min={1}
                max={200}
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>1</span>
                <span className="font-semibold">{params.targetPots} macetas</span>
                <span>200</span>
              </div>
            </div>

            {/* Hours Available */}
            <div className="input-group">
              <label className="input-label">⏰ Horas Disponibles</label>
              <input
                type="number"
                value={params.hoursAvailable || 1}
                onChange={(e) =>
                  setParams({
                    ...params,
                    hoursAvailable: Number(e.target.value),
                  })
                }
                className="input-field"
                min={1}
                max={1000000}
              />
              <input
                type="range"
                value={params.hoursAvailable || 1}
                onChange={(e) =>
                  setParams({
                    ...params,
                    hoursAvailable: Number(e.target.value),
                  })
                }
                className="input-range"
                min={1}
                max={16}
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>1h</span>
                <span className="font-semibold">{params.hoursAvailable} horas</span>
                <span>16h</span>
              </div>
            </div>

            {/* Staff Count */}
            <div className="input-group">
              <label className="input-label">👥 Personal Disponible</label>
              <input
                type="number"
                value={params.staffCount || 1}
                onChange={(e) =>
                  setParams({ ...params, staffCount: Number(e.target.value) })
                }
                className="input-field"
                min={1}
                max={1000000}
              />
              <input
                type="range"
                value={params.staffCount || 1}
                onChange={(e) =>
                  setParams({ ...params, staffCount: Number(e.target.value) })
                }
                className="input-range"
                min={1}
                max={30}
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>1</span>
                <span className="font-semibold">{params.staffCount} personas</span>
                <span>30</span>
              </div>
            </div>

            {/* Trays Available */}
            <div className="input-group">
              <label className="input-label">🔥 Bandejas Disponibles</label>
              <input
                type="number"
                value={params.traysAvailable || 1}
                onChange={(e) =>
                  setParams({ ...params, traysAvailable: Number(e.target.value) })
                }
                className="input-field"
                min={1}
                max={1000000}
              />
              <input
                type="range"
                value={params.traysAvailable || 1}
                onChange={(e) =>
                  setParams({ ...params, traysAvailable: Number(e.target.value) })
                }
                className="input-range"
                min={1}
                max={40}
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>1</span>
                <span className="font-semibold">{params.traysAvailable || 4} bandejas</span>
                <span>40</span>
              </div>
            </div>
          </div>

          {/* Opción de optimización de bandejas */}
          <div className="mt-6 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={params.maximizeTrays}
                  onChange={(e) =>
                    setParams({ ...params, maximizeTrays: e.target.checked })
                  }
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${params.maximizeTrays ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${params.maximizeTrays ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                </div>
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  🌟 Maximizar Bandejas (Secado Uniforme)
                  {params.maximizeTrays && (
                    <span className="badge badge-success text-xs">ACTIVO</span>
                  )}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Usa más bandejas para evitar el centro (amarillo) y solo usar bordes (verde)
                </div>
              </div>
            </label>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleSimulate}
              disabled={loading || !apiStatus}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Simulando...
                </>
              ) : (
                <>
                  🚀 Ejecutar Simulación Completa
                </>
              )}
            </button>

            {result && (
              <div className={`badge ${result.summary.isViable ? 'badge-success' : 'badge-error'} text-base py-3 px-6`}>
                {result.summary.isViable ? '✅ VIABLE' : '⛔ NO VIABLE'}
              </div>
            )}
          </div>
        </div>

        {/* Results Content */}
        {!result && !loading && (
          <div className="card text-center py-16 animate-fade-in">
            <div className="text-7xl mb-6">🌱</div>
            <h3 className="text-2xl font-bold mb-3">¡Bienvenido al Simulador!</h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              Ajusta los parámetros en el panel de control y presiona
              &quot;Ejecutar Simulación&quot; para ver cómo optimizar la producción de macetas biodegradables.
            </p>
          </div>
        )}

        {loading && (
          <div className="card text-center py-16">
            <div className="text-7xl mb-6 animate-pulse-glow inline-block">⚙️</div>
            <h3 className="text-2xl font-bold">Procesando simulación...</h3>
            <p className="text-[var(--text-muted)] mt-2">
              Calculando dosificación, asignación de personal y distribución óptima
            </p>
          </div>
        )}

        {result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1rem' }}>
                  <div className="card-stat">
                    <div className="stat-icon">🏺</div>
                    <div className="stat-value">{params.targetPots}</div>
                    <div className="stat-label">Macetas Objetivo</div>
                  </div>
                  <div className="card-stat">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">{result.dosage.estimates.totalCostBs}</div>
                    <div className="stat-label">Costo Total (Bs)</div>
                  </div>
                  <div className="card-stat">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{result.staffAllocation.timeline.totalHours}h</div>
                    <div className="stat-label">Tiempo Total</div>
                  </div>
                  <div className="card-stat">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{result.staffAllocation.totalStaff}</div>
                    <div className="stat-label">Personal</div>
                  </div>
                </div>

                {/* Viabilidad */}
                <div className={`card ${result.summary.isViable ? 'glow-box' : 'border-red-500'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${result.summary.isViable
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                      }`}>
                      {result.summary.isViable ? '✅' : '⛔'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {result.summary.isViable
                          ? 'Producción Viable'
                          : 'Producción No Viable'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                          <div className="text-xs text-[var(--text-muted)]">Producción</div>
                          <div className="font-bold">{result.staffAllocation.feasibility.productionTimeNeeded}h</div>
                        </div>
                        <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                          <div className="text-xs text-[var(--text-muted)]">Horneado</div>
                          <div className="font-bold">4h</div>
                        </div>
                        <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                          <div className="text-xs text-[var(--text-muted)]">Ciclo Total</div>
                          <div className="font-bold text-[var(--accent-primary)]">{result.staffAllocation.timeline.totalHours}h</div>
                        </div>
                        <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                          <div className="text-xs text-[var(--text-muted)]">Disponible</div>
                          <div className="font-bold">{params.hoursAvailable}h</div>
                        </div>
                      </div>
                      {result.summary.viabilityReason && (
                        <p className={`text-sm ${result.summary.isViable ? 'text-green-500' : 'text-red-400'}`}>
                          {result.summary.viabilityReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resumen de Insumos */}
                <div className="card">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📦</span>
                    Resumen de Insumos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="text-3xl mb-2">🥚</div>
                      <div className="text-xl font-bold">{result.dosage.inputs.eggshell.kg} kg</div>
                      <div className="text-xs text-[var(--text-muted)]">Cáscara de Huevo</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="text-3xl mb-2">🧪</div>
                      <div className="text-xl font-bold">{result.dosage.inputs.alginate.bags} bolsas</div>
                      <div className="text-xs text-[var(--text-muted)]">Alginato</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="text-3xl mb-2">💧</div>
                      <div className="text-xl font-bold">{result.dosage.inputs.water.liters} L</div>
                      <div className="text-xs text-[var(--text-muted)]">Agua</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="text-xl font-bold">{result.trayDistribution.summary?.traysUsed || 0}</div>
                      <div className="text-xs text-[var(--text-muted)]">Bandejas</div>
                    </div>
                  </div>
                </div>

                {/* Alertas */}
                {result.summary.totalAlerts.length > 0 && (
                  <AlertsPanel alerts={result.summary.totalAlerts} />
                )}
              </div>
            )}

            {/* Dosage Tab */}
            {activeTab === "dosage" && (
              <DosageCard dosage={result.dosage} targetPots={params.targetPots} />
            )}

            {/* Staff Tab */}
            {activeTab === "staff" && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <StaffChart
                  allocation={result.staffAllocation.staffAllocation}
                  totalStaff={result.staffAllocation.totalStaff}
                  timeline={result.staffAllocation.timeline}
                  efficiency={result.staffAllocation.efficiency}
                  targetPots={params.targetPots}
                  detailedBreakdown={result.staffAllocation.detailedBreakdown}
                />

                {result.staffAllocation.alerts.length > 0 && (
                  <AlertsPanel
                    alerts={result.staffAllocation.alerts}
                    title="Alertas de Personal"
                  />
                )}
              </div>
            )}

            {/* Tray Tab */}
            {activeTab === "tray" && result.trayDistribution.success && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Density Analysis */}
                {result.trayDistribution.densityAnalysis && (
                  <div className={`card ${result.trayDistribution.densityAnalysis.level === 'alto'
                    ? 'border-amber-500'
                    : result.trayDistribution.densityAnalysis.level === 'bajo'
                      ? 'border-green-500'
                      : ''
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${result.trayDistribution.densityAnalysis.level === 'alto'
                        ? 'bg-amber-500/20'
                        : result.trayDistribution.densityAnalysis.level === 'bajo'
                          ? 'bg-green-500/20'
                          : 'bg-blue-500/20'
                        }`}>
                        {result.trayDistribution.densityAnalysis.level === 'alto' ? '⚠️' :
                          result.trayDistribution.densityAnalysis.level === 'bajo' ? '✅' : 'ℹ️'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Densidad de Carga:
                          <span className={`ml-2 capitalize ${result.trayDistribution.densityAnalysis.level === 'alto'
                            ? 'text-amber-500'
                            : result.trayDistribution.densityAnalysis.level === 'bajo'
                              ? 'text-green-500'
                              : 'text-blue-500'
                            }`}>
                            {result.trayDistribution.densityAnalysis.level}
                          </span>
                        </h3>
                        <p className="text-[var(--text-muted)]">
                          {result.trayDistribution.densityAnalysis.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tray Visualization */}
                <div className="card">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>🔥</span>
                    Distribución en Bandejas
                    <span className="badge badge-info ml-auto">
                      {result.trayDistribution.summary?.traysUsed} bandeja(s)
                    </span>
                  </h3>

                  {result.trayDistribution.trays && (
                    <TrayVisualizer trays={result.trayDistribution.trays} />
                  )}
                </div>

                {/* Rotation Schedule */}
                {result.trayDistribution.rotationSchedule && (
                  <TimelineSchedule schedule={result.trayDistribution.rotationSchedule} />
                )}
              </div>
            )}

            {activeTab === "tray" && !result.trayDistribution.success && (
              <div className="card text-center py-12 border-red-500">
                <div className="text-6xl mb-4">⛔</div>
                <h3 className="text-xl font-bold text-red-500 mb-2">
                  {result.trayDistribution.error}
                </h3>
                <p className="text-[var(--text-muted)]">
                  {result.trayDistribution.recommendation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[var(--border-light)] text-center">
          <p className="text-sm text-[var(--text-muted)]">
            🌱 EcoLlajta Smart-Twin v1.0 • Investigación Operativa II • UMSS 2026
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Desarrollado por el grupo Messi
          </p>
        </footer>
      </main>
    </div>
  );
}
