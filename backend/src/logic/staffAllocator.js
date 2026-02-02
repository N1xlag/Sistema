/**
 * EcoLlajta Smart-Twin - Motor de Asignación de Personal
 * Distribuye al equipo en estaciones según la meta de producción
 */

const CONSTANTS = require('../config/constants');

/**
 * Calcula la distribución óptima de personal
 * @param {number} targetPots - Cantidad de macetas objetivo
 * @param {number} hoursAvailable - Horas de trabajo disponibles
 * @param {number} staffCount - Personal disponible (default: 11)
 * @returns {Object} Distribución de personal y tiempos
 */
function allocateStaff(targetPots, hoursAvailable, staffCount = 11) {
    const { TIMES, PERFORMANCE, STATIONS, CONSTRAINTS } = CONSTANTS;



    // Ajuste inicial de factor de eficiencia (para debugging/referencia)
    let efficiencyFactor = 1.0;
    if (staffCount <= 2) efficiencyFactor = staffCount === 1 ? 3.0 : 2.0;
    else if (staffCount < 5) efficiencyFactor = 1.5;
    else if (staffCount > 15) efficiencyFactor = 1.2;

    // Nota: Los tiempos precisos se recalculan más abajo con breakdown.


    // Distribución base (proporcional a la carga de trabajo)
    const workloadDistribution = {
        molienda: 0.15,      // 15% del esfuerzo
        dosificacion: 0.10,  // 10% del esfuerzo
        mezclado: 0.25,      // 25% del esfuerzo
        moldeado: 0.30,      // 30% del esfuerzo (cuello de botella manual)
        horneado: 0.10,      // 10% del esfuerzo
        control: 0.10        // 10% control de calidad
    };

    // Tasas base por persona (macetas/hora) estimadas
    const RATES = {
        molienda: 60,
        dosificacion: 90,
        mezclado: 40,
        moldeado: 30, // Bottleneck original (~28.9)
        horneado: 100,
        control: 100
    };

    // Calcular personal por estación (o tareas asignadas si es poco personal)
    const allocation = {};
    let totalAllocated = 0;

    // Modo de operación: Secuencial (<= 3 staff) o Paralelo (> 3 staff)
    // El usuario pidió diferenciar visualmente si se hacen a la vez o no.
    const isSequential = staffCount <= 3;

    // Distribución lógica
    if (staffCount <= 2) {
        // Asignación ficticia para mostrar carga
        Object.keys(workloadDistribution).forEach(station => {
            allocation[station] = { staff: 1, percentage: '100% (Rotativo)' };
        });
        totalAllocated = staffCount;
    } else {
        Object.entries(workloadDistribution).forEach(([station, weight]) => {
            const raw = Math.round(staffCount * weight);
            const min = STATIONS[station.toUpperCase()]?.minStaff || 1;
            const max = STATIONS[station.toUpperCase()]?.maxStaff || staffCount;

            allocation[station] = {
                staff: Math.max(min, Math.min(raw, max)),
                percentage: (weight * 100).toFixed(0) + '%'
            };
            totalAllocated += allocation[station].staff;
        });

        // Balanceo simple de staff
        let difference = staffCount - totalAllocated;
        if (difference !== 0) {
            allocation.moldeado.staff = Math.max(1, allocation.moldeado.staff + difference);
        }
    }

    // Calcular tiempos reales por estación
    const breakdown = [];
    let cumulativeTime = 0;
    let maxParallelTime = 0;

    Object.keys(RATES).forEach(station => {
        const ratePerPerson = RATES[station];
        let assignedStaff = allocation[station] ? allocation[station].staff : 1;
        if (isSequential) assignedStaff = staffCount; // En secuencial, todo el equipo ataca la tarea (o se divide pero no avanza fase)

        const hoursNeeded = targetPots / (ratePerPerson * assignedStaff);
        const minutesNeeded = hoursNeeded * 60;

        breakdown.push({
            station,
            staff: assignedStaff,
            minutes: minutesNeeded,
            hours: hoursNeeded.toFixed(2),
            mode: isSequential ? 'Secuencial' : 'Paralelo'
        });

        if (isSequential) {
            cumulativeTime += minutesNeeded;
        } else {
            // En paralelo, el tiempo lo dicta la estación más lenta (Bottleneck)
            if (minutesNeeded > maxParallelTime) maxParallelTime = minutesNeeded;
        }
    });

    // Calcular Production Time Final
    // Paralelo tiene overhead de coordinación y llenado de pipeline (~10%)
    const productionTimeMinutes = isSequential
        ? cumulativeTime
        : maxParallelTime * 1.1;

    const productionTimeHours = productionTimeMinutes / 60;

    // Tiempo TOTAL del ciclo
    const totalCycleMinutes = TIMES.PRECALENTADO_MIN + productionTimeMinutes + TIMES.BAKING_TOTAL_MIN;
    const totalCycleHours = totalCycleMinutes / 60;

    const isViable = totalCycleHours <= hoursAvailable;

    // Calcular tiempos estimados (para compatibilidad con timeline)
    const timeline = {
        setup: TIMES.PRECALENTADO_MIN,
        production: productionTimeMinutes,
        baking: TIMES.BAKING_TOTAL_MIN,
        totalMinutes: totalCycleMinutes,
        totalHours: totalCycleHours.toFixed(1)
    };

    // Alertas
    const alerts = [];
    const recommendedStaff = Math.max(4, Math.ceil(targetPots / 15));

    if (staffCount <= 2) {
        alerts.push({
            type: 'error',
            message: `⚠️ PERSONAL CRÍTICO (${staffCount}): Trabajo 100% Secuencial. Cada etapa se suma al tiempo total. Se recomienda mínimo 4 personas para paralelizar.`
        });
    } else if (staffCount <= 3) {
        alerts.push({
            type: 'warning',
            message: `⚠️ Personal Limitado (${staffCount}): Trabajo mayormente secuencial con paralelismo bajo.`
        });
    }

    if (!isViable) {
        alerts.push({
            type: 'error',
            message: `TIEMPO INSUFICIENTE: Se requieren ${totalCycleHours.toFixed(1)}h. Disp: ${hoursAvailable}h.`
        });
        if (staffCount < recommendedStaff) {
            alerts.push({
                type: 'info',
                message: `💡 SUGERENCIA: Aumentar personal a ${recommendedStaff} permitiría trabajo paralelo efectivo.`
            });
        }
    }

    if (targetPots > CONSTRAINTS.MAX_POTS_PER_GROUP * 10) {
        alerts.push({
            type: 'warning',
            message: 'Producción masiva: riesgo de saturación del deshidratador'
        });
    }

    return {
        feasibility: {
            isViable,
            targetPots,
            hoursAvailable,
            productionTimeNeeded: productionTimeHours.toFixed(2),
            totalCycleTime: totalCycleHours.toFixed(2),
            isSequential
        },
        staffAllocation: allocation,
        totalStaff: staffCount,
        recommendedStaff,
        timeline, // Mantener compatibilidad básica
        detailedBreakdown: breakdown, // Nuevo desglose detallado
        efficiency: {
            potsPerPerson: (targetPots / staffCount).toFixed(1),
            potsPerHour: (targetPots / productionTimeHours).toFixed(1)
        },
        alerts
    };
}


/**
 * Genera un cronograma de trabajo detallado
 * @param {Object} allocation - Resultado de allocateStaff
 * @returns {Array} Cronograma de actividades
 */
function generateSchedule(allocation) {
    const { TIMES } = CONSTANTS;
    let currentTime = 0;

    const schedule = [
        {
            phase: 'Preparación',
            startMin: currentTime,
            endMin: currentTime + TIMES.PRECALENTADO_MIN,
            activities: ['Precalentamiento del horno', 'Preparación de moldes', 'Pesaje de insumos']
        }
    ];

    currentTime += TIMES.PRECALENTADO_MIN;

    schedule.push({
        phase: 'Producción',
        startMin: currentTime,
        endMin: currentTime + allocation.timeline.production,
        activities: ['Molienda', 'Dosificación', 'Mezclado', 'Moldeado']
    });

    currentTime += allocation.timeline.production;

    schedule.push({
        phase: 'Horneado - Fase 1',
        startMin: currentTime,
        endMin: currentTime + TIMES.BAKING_FLIP_MIN,
        activities: ['Deshidratación inicial', 'Monitoreo de temperatura'],
        critical: true,
        alert: '⚠️ PUNTO CRÍTICO: Voltear macetas y secar líquido residual'
    });

    currentTime += TIMES.BAKING_FLIP_MIN;

    schedule.push({
        phase: 'Horneado - Fase 2',
        startMin: currentTime,
        endMin: currentTime + TIMES.BAKING_FLIP_MIN,
        activities: ['Deshidratación final', 'Control de calidad visual']
    });

    return schedule;
}

module.exports = {
    allocateStaff,
    generateSchedule
};
