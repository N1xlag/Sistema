/**
 * EcoLlajta Smart-Twin - Predicciones Matemáticas (Punto Cero)
 */
function calculateOptimalResources(targetPots, hoursAvailable, grindGrams = 4800, grindMins = 45) {
    const Q = parseInt(targetPots) || 0;
    const hours = parseFloat(hoursAvailable) || 0;
    const T = hours * 60;

    if (Q === 0 || T === 0) return null;

    // 1. Takt Time (Ritmo exigido)
    const taktTime = T / Q;

    // 2. Mezcladores (TM = 3 min)
    const mixers = Math.max(1, Math.ceil(3 / taktTime));

    // 3. Moldes Óptimos (TS = 5 min -> 3 moldes por persona)
    const molds = mixers * 3;

    // 4. Molienda
    const totalGrams = Q * 168;
    const capacityPerGrinder = (grindGrams / grindMins) * T;
    const grinders = Math.max(1, Math.ceil(totalGrams / (capacityPerGrinder || 1)));

    // 5. Personal Total (Molienda + 1 Pesaje + Mezcladores + 1 Desmolde)
    const totalStaff = grinders + 1 + mixers + 1;

    // 6. Tiempo Real Proyectado
    const tcReal = Math.max(3 / mixers, 5 / molds);
    const realProductionHours = (9 + (Q - 1) * tcReal) / 60;

    return {
        targetPots: Q,
        totalStaff: totalStaff, // Este dato viajará directo al slider
        tools: {
            molds: molds,       // Este dato viajará directo al slider
            bowls: mixers,
            scales: 1,
            grinders: grinders
        },
        time: {
            realHours: realProductionHours.toFixed(2)
        },
        stats: {
            bottleneck: (3/mixers) >= (5/molds) ? "Personal (Mezcla)" : "Equipo (Moldes)"
        }
    };
}

module.exports = { calculateOptimalResources };