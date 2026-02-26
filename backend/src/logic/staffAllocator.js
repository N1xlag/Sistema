/**
 * EcoLlajta Smart-Twin - Asignador de Personal (Sincronizado JIT)
 */

function allocateStaff(targetPots, hoursAvailable, staffCount = 6, moldsAvailable = 5, customBakingMinutes = null, grindGrams = 4800, grindMins = 45) {
    const pots = parseInt(targetPots) || 0;
    const hours = parseFloat(hoursAvailable) || 8;
    const T = hours * 60;
    const staff = parseInt(staffCount) || 6;

    // 1. MOLIENDA
    const totalGrams = pots * 168;
    const gGrams = parseFloat(grindGrams) || 4800;
    const gMins = parseFloat(grindMins) || 45;
    const grindRatePerMin = gGrams / gMins;
    const capacityPerGrinder = grindRatePerMin * T;
    const grindersNeeded = Math.max(1, Math.ceil(totalGrams / (capacityPerGrinder || 1)));

    // 2. REPARTICIÓN ESTRICTA (Línea Continua)
    const weighers = 1;
    const unmolders = 1;
    let remainingForMix = staff - grindersNeeded - weighers - unmolders;
    const mixers = Math.max(1, remainingForMix); 

    const allocation = {
        molienda: { staff: grindersNeeded, percentage: 'Proceso Previo' },
        dosificacion: { staff: weighers, percentage: 'Fase Rápida' },
        mezclado: { staff: mixers, percentage: 'Fase Principal' },
        moldeado: { staff: unmolders, percentage: 'Fase Rápida' },
        horneado: { staff: 1, percentage: 'Post-Prod' },
        control: { staff: 1, percentage: 'Post-Prod' }
    };

    // 3. TIEMPOS REALES DE TRABAJO (Aquí está la magia para la gráfica)
    const moliendaMins = (totalGrams / grindRatePerMin) / (grindersNeeded || 1);

    const stationMins = {
        molienda: moliendaMins,
        dosificacion: pots * 1, // 1 min de pesaje por maceta
        mezclado: pots * (3 / mixers), // 3 mins dividido entre los mezcladores
        moldeado: pots * 1, // 1 min de desmolde por maceta
        horneado: 240, 
        control: pots * 1 // 1 min por control
    };

    const breakdown = Object.keys(allocation).map(station => ({
        station,
        staff: allocation[station].staff,
        minutes: stationMins[station] || 0,
        hours: ((stationMins[station] || 0) / 60).toFixed(2),
        mode: allocation[station].percentage
    }));

    // 4. TIEMPO DE CICLO GLOBAL
    const tcReal = Math.max(3 / mixers, 5 / (parseInt(moldsAvailable) || 1));
    const prodHours = pots > 0 ? (9 + (pots - 1) * tcReal) / 60 : 0;

    return {
        feasibility: { isViable: prodHours <= hours, targetPots: pots, hoursAvailable: hours, productionTimeNeeded: prodHours.toFixed(2), totalCycleTime: (prodHours + 4).toFixed(2), isSequential: false },
        staffAllocation: allocation,
        totalStaff: staff,
        recommendedStaff: grindersNeeded + 1 + Math.max(1, Math.ceil(3 / (T/pots))) + 1,
        timeline: { setupHours: "0.5", productionHours: prodHours.toFixed(1), bakingHours: "4.0", totalHours: (prodHours + 4.5).toFixed(1) },
        detailedBreakdown: breakdown,
        efficiency: { potsPerPerson: (pots / staff).toFixed(1), potsPerHour: (pots / (prodHours || 1)).toFixed(1) },
        alerts: []
    };
}

// ESTO ES LO QUE FALTABA Y HACÍA EXPLOTAR TODO
function generateSchedule() { return []; }
module.exports = { allocateStaff, generateSchedule };