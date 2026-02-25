/**
 * EcoLlajta Smart-Twin - Planificador Físico (Lógica de Línea Simultánea)
 */

function calculateOptimalResources(targetPots, hoursAvailable, grindGrams = 1000, grindMins = 20) {
    const timeLimit = parseFloat(hoursAvailable) > 0 ? parseFloat(hoursAvailable) : 8;
    const ratePerHourPerStation = 15;
    const requiredPotsPerHour = targetPots / timeLimit;
    const stationsNeeded = Math.max(1, Math.ceil(requiredPotsPerHour / ratePerHourPerStation));

    // Herramientas físicas por estación
    const molds = Math.max(2, stationsNeeded * 2); 
    const bowls = stationsNeeded;
    const scales = stationsNeeded;

    // --- NUEVA LÓGICA DE MOLINOS ---
    const totalEggshellGrams = targetPots * 168; 
    const ratePerMin = (parseFloat(grindGrams) || 1000) / (parseFloat(grindMins) || 20);
    const capacityPerGrinder = ratePerMin * (timeLimit * 60); // Usa el tiempo global en minutos
    const grindersNeeded = Math.ceil(totalEggshellGrams / capacityPerGrinder);

    const realProductionHours = targetPots / (stationsNeeded * ratePerHourPerStation);

    return {
        targetPots,
        timeLimit,
        tools: {
            stations: stationsNeeded,
            molds,
            bowls,
            scales,
            grinders: Math.max(1, grindersNeeded) // Mínimo 1 molino siempre
        },
        time: {
            realHours: realProductionHours.toFixed(2),
            cycleMin: 8,
            potsPerCycle: 2
        }
    };
}

module.exports = { calculateOptimalResources };