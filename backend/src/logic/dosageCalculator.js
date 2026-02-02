/**
 * EcoLlajta Smart-Twin - Motor de Dosificación
 * Calcula los insumos necesarios según la meta de producción
 */

const CONSTANTS = require('../config/constants');

/**
 * Calcula los insumos necesarios para una cantidad de macetas
 * @param {number} targetPots - Cantidad de macetas objetivo
 * @returns {Object} Insumos calculados y alertas
 */
function calculateDosage(targetPots) {
    const { RATIO, PERFORMANCE, CONSTRAINTS } = CONSTANTS;

    // Cálculo de materiales
    const eggshellNeeded = targetPots * RATIO.EGGSHELL_GRAMS;
    const alginateNeeded = targetPots * RATIO.ALGINATE_GRAMS;
    const waterNeeded = Math.ceil(targetPots / 3) * RATIO.WATER_ML; // Por lote de 3

    // Estimación de merma y producción real
    const expectedWaste = CONSTRAINTS.TYPICAL_WASTE_GRAMS * Math.ceil(targetPots / 21);
    const expectedDefects = Math.ceil(targetPots * PERFORMANCE.DEFECT_RATE);
    const expectedFunctional = targetPots - expectedDefects;

    // Costo total estimado
    const totalCost = targetPots * PERFORMANCE.COST_PER_UNIT_BS;

    // Alertas del sistema
    const alerts = [];

    if (alginateNeeded > 454) {
        const bags = Math.ceil(alginateNeeded / 454);
        alerts.push({
            type: 'info',
            message: `Necesitará ${bags} bolsas de alginato (454g c/u)`
        });
    }

    if (targetPots > 200) {
        alerts.push({
            type: 'warning',
            message: 'Producción alta: considere dividir en múltiples ciclos'
        });
    }

    return {
        inputs: {
            eggshell: {
                grams: eggshellNeeded,
                kg: (eggshellNeeded / 1000).toFixed(2)
            },
            alginate: {
                grams: alginateNeeded,
                bags: Math.ceil(alginateNeeded / 454)
            },
            water: {
                ml: waterNeeded,
                liters: (waterNeeded / 1000).toFixed(2)
            },
            oil: {
                liters: 0.5 * Math.ceil(targetPots / 21)
            }
        },
        estimates: {
            functionalUnits: expectedFunctional,
            defectUnits: expectedDefects,
            wasteGrams: expectedWaste,
            totalCostBs: totalCost.toFixed(2),
            costPerUnit: PERFORMANCE.COST_PER_UNIT_BS
        },
        ratio: {
            description: '10:1 (Huevo:Alginato)',
            isValid: true
        },
        alerts
    };
}

/**
 * Valida si una relación de mezcla personalizada es correcta
 * @param {number} eggshell - Gramos de cáscara de huevo
 * @param {number} alginate - Gramos de alginato
 * @returns {Object} Validación de la mezcla
 */
function validateMixRatio(eggshell, alginate) {
    const actualRatio = eggshell / alginate;
    const targetRatio = CONSTANTS.RATIO.RATIO_VALUE;
    const tolerance = 0.5; // ±5% de tolerancia

    const isValid = Math.abs(actualRatio - targetRatio) <= tolerance;

    let quality = 'óptima';
    let risk = 'bajo';

    if (actualRatio < targetRatio - tolerance) {
        quality = 'exceso de alginato - maceta pegajosa';
        risk = 'medio';
    } else if (actualRatio > targetRatio + tolerance) {
        quality = 'falta de alginato - maceta frágil';
        risk = 'alto';
    }

    return {
        actualRatio: actualRatio.toFixed(2),
        targetRatio: `${targetRatio}:1`,
        isValid,
        quality,
        risk,
        recommendation: isValid
            ? 'Mezcla dentro de parámetros óptimos'
            : `Ajuste la proporción a ${targetRatio}:1 para garantizar resistencia`
    };
}

module.exports = {
    calculateDosage,
    validateMixRatio
};
