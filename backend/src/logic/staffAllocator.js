/**
 * EcoLlajta Smart-Twin - Motor de Asignación de Personal (Lógica de Grupos Reales)
 */

const CONSTANTS = require('../config/constants');

function allocateStaff(targetPots, hoursAvailable, staffCount = 11, moldsAvailable = 5, customBakingMinutes = null) {
    const { TIMES, MOLDS } = CONSTANTS;
    const alerts = [];

    // 1. LAS 4 TAREAS CORE (Donde se reparte el grupo de trabajo real)
    const CORE_STATIONS = {
        molienda: 0.20,
        dosificacion: 0.15,
        mezclado: 0.25,
        moldeado: 0.40
    };

    // 2. TAREAS POST-PRODUCCIÓN (Solo 1 vigilante asíncrono)
    const POST_STATIONS = ['horneado', 'control'];

    const RATES = {
        molienda: 60,
        dosificacion: 90,
        mezclado: 40,
        moldeado: 30, 
        horneado: 100,
        control: 100
    };

    const allocation = {};
    
    // Si hay menos de 4 personas, físicamente no pueden cubrir 4 estaciones en paralelo
    const isSequential = staffCount < 4;

    // --- FASE 1: REPARTIR PERSONAL EN EL CORE ---
    if (isSequential) {
        // Modo Rotativo: Todo el grupo avanza junto etapa por etapa
        Object.keys(CORE_STATIONS).forEach(station => {
            allocation[station] = { staff: staffCount, percentage: '100% (Rotativo)' };
        });
    } else {
        // Modo Paralelo: Garantizamos MÍNIMO 1 persona por estación para que no existan ceros
        Object.keys(CORE_STATIONS).forEach(station => {
            allocation[station] = { staff: 1, percentage: '0%' };
        });

        // Ya gastamos 4 personas. ¿Cuántas sobran del grupo definido?
        let remainingStaff = staffCount - 4;

        // Repartimos a los sobrantes al que más lo necesite matemáticamente
        while (remainingStaff > 0) {
            let maxDeficit = -999;
            let targetStation = 'moldeado'; 

            Object.entries(CORE_STATIONS).forEach(([station, weight]) => {
                let idealStaff = staffCount * weight;
                let deficit = idealStaff - allocation[station].staff;

                if (deficit > maxDeficit) {
                    maxDeficit = deficit;
                    targetStation = station;
                }
            });

            allocation[targetStation].staff++;
            remainingStaff--;
        }

        // Calcular porcentajes reales
        Object.keys(CORE_STATIONS).forEach(station => {
            allocation[station].percentage = ((allocation[station].staff / staffCount) * 100).toFixed(0) + '%';
        });
    }

    // --- FASE 2: ASIGNAR VIGILANCIA EN POST-PRODUCCIÓN ---
    POST_STATIONS.forEach(station => {
        allocation[station] = { staff: 1, percentage: 'Post-Prod' };
    });

    // --- RESTRICCIÓN DE MOLDES ---
    const moldRestTime = MOLDS?.REST_TIME_MIN || TIMES.MOLD_REST_MIN || 5; 
    const cyclesPerHour = 60 / moldRestTime;
    const maxPotsByMolds = moldsAvailable * cyclesPerHour; 

    if (targetPots > maxPotsByMolds * (parseFloat(hoursAvailable) || 8)) {
        alerts.push({
            type: 'warning',
            message: `⚠️ Moldes limitantes: Asegúrate de que los ${moldsAvailable} moldes puedan rotar lo suficientemente rápido.`
        });
    }

    // --- CALCULAR TIEMPOS (SOLO EL CORE DICTA EL TIEMPO) ---
    const breakdown = [];
    let cumulativeTime = 0;
    let maxParallelTime = 0;

    Object.keys(CORE_STATIONS).forEach(station => {
        const ratePerPerson = RATES[station];
        let assignedStaff = allocation[station].staff;
        let effectiveStaff = isSequential ? staffCount : assignedStaff; 

        const hoursNeeded = targetPots / (ratePerPerson * effectiveStaff);
        const minutesNeeded = hoursNeeded * 60;

        breakdown.push({
            station,
            staff: assignedStaff,
            minutes: minutesNeeded,
            hours: hoursNeeded.toFixed(2),
            mode: isSequential ? 'Rotativo' : 'Paralelo'
        });

        if (isSequential) {
            cumulativeTime += minutesNeeded;
        } else {
            if (minutesNeeded > maxParallelTime) maxParallelTime = minutesNeeded;
        }
    });

    // Añadimos Post-Prod al desglose visual
    POST_STATIONS.forEach(station => {
        const hoursNeeded = targetPots / RATES[station];
        breakdown.push({
            station,
            staff: 1,
            minutes: hoursNeeded * 60,
            hours: hoursNeeded.toFixed(2),
            mode: 'Fase 2 (Asíncrono)'
        });
    });

    // 10% de penalización por coordinación si es paralelo
    const productionTimeMinutes = isSequential ? cumulativeTime : maxParallelTime * 1.1; 
    const productionTimeHours = productionTimeMinutes / 60;
    
    const bakingTimeMinutes = customBakingMinutes !== null ? customBakingMinutes : TIMES.BAKING_TOTAL_MIN;
    const totalCycleMinutes = TIMES.PRECALENTADO_MIN + productionTimeMinutes + bakingTimeMinutes;
    const totalCycleHours = totalCycleMinutes / 60;

    const availableHoursNum = parseFloat(hoursAvailable) || 0;
    const isViable = totalCycleHours <= (availableHoursNum - 0.01);
    const totalCycleRounded = Math.round(totalCycleHours * 10) / 10; 
    const productionRounded = Math.round(productionTimeHours * 10) / 10;

    const timeline = {
        setup: TIMES.PRECALENTADO_MIN,
        setupHours: (TIMES.PRECALENTADO_MIN / 60).toFixed(1),
        production: productionTimeMinutes,
        productionHours: productionRounded.toFixed(1),
        baking: bakingTimeMinutes,
        bakingHours: (bakingTimeMinutes / 60).toFixed(1),
        totalMinutes: Math.round(totalCycleMinutes),
        totalHours: totalCycleRounded.toFixed(1)
    };

    if (!isViable) {
        alerts.push({
            type: 'error',
            message: `Tiempo insuficiente: Su grupo de ${staffCount} requiere ${totalCycleRounded.toFixed(1)}h, pero solo dispuso ${availableHoursNum.toFixed(1)}h.`
        });
    }

    return {
        feasibility: {
            isViable, targetPots, hoursAvailable, moldsAvailable,
            maxPotsByMolds: Math.round(maxPotsByMolds),
            productionTimeNeeded: productionTimeHours.toFixed(2),
            totalCycleTime: totalCycleHours.toFixed(2),
            isSequential
        },
        staffAllocation: allocation,
        totalStaff: staffCount,
        timeline,
        detailedBreakdown: breakdown,
        efficiency: {
            potsPerPerson: (targetPots / staffCount).toFixed(1),
            potsPerHour: (targetPots / productionTimeHours).toFixed(1)
        },
        alerts
    };
}

function generateSchedule(allocation) {
    return []; 
}

module.exports = { allocateStaff, generateSchedule };