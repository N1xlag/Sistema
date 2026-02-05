/**
 * EcoLlajta Smart-Twin - Optimizador de Recursos
 * Calcula los recursos ideales (Staff, Bandejas, Tiempo) para una meta dada.
 */

const CONSTANTS = require('../config/constants');
const { countEdgePositions, optimizeTrayDistribution } = require('./trayOptimizer');

/**
 * Calcula los recursos óptimos para una producción objetivo
 * asumiendo una jornada laboral estándar o buscando la eficiencia máxima.
 * @param {number} targetPots - Meta de producción
 * @param {boolean} maximizeTrays - Preferencia de usuario
 * @param {number} traySpacing - Espaciado (1=Compacto, 2=Standard)
 * @param {string} optimizationMode - Modo de optimización
 */
function calculateOptimalResources(targetPots, maximizeTrays = false, traySpacing = 2, optimizationMode = 'balanced') {
    const { TIMES, DEHYDRATOR, PERFORMANCE, MOLDS } = CONSTANTS;

    // 1. Optimización de BANDEJAS (Trays) usando el optimizador real
    // Esto nos dará el tiempo de horneado REAL según la configuración
    const trayOptimization = optimizeTrayDistribution(
        targetPots,
        maximizeTrays,
        50, // Asumimos suficientes bandejas físicas para el cálculo ideal
        traySpacing,
        optimizationMode
    );

    // Obtenemos los tiempos reales calculados
    const realBakingHours = trayOptimization.bakingInfo.totalBakingHours;
    const realBakingMinutes = realBakingHours * 60;

    // Cálculos de recomendaciones de bandejas
    const edgePerTray = 2 * DEHYDRATOR.GRID_ROWS + 2 * (DEHYDRATOR.GRID_COLS - 2);
    const totalCapacityPerTray = DEHYDRATOR.CAPACITY_PER_TRAY;
    const optimalTrays = Math.ceil(targetPots / edgePerTray);
    const minTrays = Math.ceil(targetPots / totalCapacityPerTray);

    // 2. Optimización de PERSONAL (Staff) para Jornada Estándar (8h)
    // Ajustamos la ventana de producción: 8h jornada - tiempo de horno (dinámico) - setup
    // Si el horno toma mucho (ej 6h), queda poco para producción, lo que exigiría MUCHO personal.
    // Para evitar recomendaciones irreales, aseguramos una ventana mínima de 2h o usamos un estándar razonable.

    let productionWindowHours = 8 - realBakingHours - (TIMES.PRECALENTADO_MIN / 60);
    if (productionWindowHours < 2) productionWindowHours = 3.5; // Fallback razonable si el horno consume todo el día

    const requiredThroughput = targetPots / productionWindowHours;
    const rateMoldeado = 30;
    const staffMoldeado = Math.ceil(requiredThroughput / rateMoldeado);

    let recommendedStaff8h = Math.ceil(staffMoldeado * 3.33);
    if (recommendedStaff8h < 4) recommendedStaff8h = 4;

    // 3. Optimización de MOLDES
    const moldRestTime = MOLDS?.REST_TIME_MIN || TIMES.MOLD_REST_MIN || 5;
    const cyclesPerMoldPerHour = 60 / moldRestTime;
    const moldingRate = rateMoldeado * staffMoldeado;
    const optimalMolds = Math.ceil(moldingRate / cyclesPerMoldPerHour);
    const minMolds = Math.max(2, Math.ceil(targetPots / (cyclesPerMoldPerHour * productionWindowHours)));
    const recommendedMolds = Math.max(3, Math.min(optimalMolds, 20));

    // 4. Estimación de TIEMPO PRECISA usando el tiempo de horneado DINÁMICO
    const { allocateStaff } = require('./staffAllocator');

    // Pasamos realBakingMinutes como customBakingMinutes (5to parámetro si allocateStaff lo soporta así, o revisamos la firma)
    // Revisando staffAllocator.js: function allocateStaff(targetPots, hoursAvailable, staffCount, moldsAvailable = 5, customBakingMinutes = null)

    const simulation = allocateStaff(
        targetPots,
        24, // Damos 24h disponibles para que no corte por tiempo
        recommendedStaff8h,
        recommendedMolds,
        realBakingMinutes // <--- AQUÍ PASAMOS EL TIEMPO DINÁMICO
    );

    const realTotalTime = parseFloat(simulation.timeline.totalHours);
    const realProductionTime = parseFloat(simulation.timeline.productionHours);
    const setupMinutes = CONSTANTS.TIMES.PRECALENTADO_MIN;
    const bakingMinutes = realBakingMinutes; // Usar el calculado, no la constante

    // MARGEN DE SEGURIDAD: Añadimos 0.1h (6 min) para asegurar viabilidad al aplicar
    // Esto evita el problema de redondeo donde 8.0h recomendadas fallan con validación de 8.0h
    const safetyMargin = 0.1;
    const recommendedHours = (realTotalTime + safetyMargin).toFixed(1);

    return {
        targetPots,
        trays: {
            optimal: optimalTrays,
            minimum: minTrays,
            reason: `Configuración: ${maximizeTrays ? 'Maximizar (Zonas Seguras)' : 'Estándar'} | Espaciado: ${traySpacing === 1 ? 'Compacto (+2h)' : 'Normal'}. Requiere ${(realBakingMinutes / 60).toFixed(1)}h de horno.`
        },
        staff: {
            recommendedFor8h: recommendedStaff8h,
            explanation: `Con ${recommendedStaff8h} personas, la producción tarda ~${realProductionTime.toFixed(1)}h. Total con horno: ${recommendedHours}h.`
        },
        molds: {
            optimal: recommendedMolds,
            minimum: minMolds,
            reason: `Con ${recommendedMolds} moldes (rotación cada ${moldRestTime} min), el moldeado no será cuello de botella.`
        },
        time: {
            fastestPossible: recommendedHours, // CON MARGEN DE SEGURIDAD
            explanation: `Con ${recommendedStaff8h} personas y ${recommendedMolds} moldes, necesitas ${recommendedHours}h (incluye margen).`,
            breakdown: {
                production: realProductionTime.toFixed(1),
                productionMinutes: Math.round(simulation.timeline.production),
                baking: (bakingMinutes / 60).toFixed(1),
                bakingMinutes: bakingMinutes,
                setup: (setupMinutes / 60).toFixed(1),
                setupMinutes: setupMinutes
            }
        }
    };
}

module.exports = {
    calculateOptimalResources
};
