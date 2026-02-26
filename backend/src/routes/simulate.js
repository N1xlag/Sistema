/**
 * EcoLlajta Smart-Twin - Rutas de Simulación
 */

const express = require('express');
const router = express.Router();

const { calculateDosage, validateMixRatio } = require('../logic/dosageCalculator');
const { allocateStaff, generateSchedule } = require('../logic/staffAllocator');
const { optimizeTrayDistribution } = require('../logic/trayOptimizer');
const { calculateOptimalResources } = require('../logic/resourceOptimizer');

/**
 * POST /api/simulate/dosage
 * Calcula los insumos necesarios para una meta de producción
 */
router.post('/dosage', (req, res) => {
    try {
        const { targetPots } = req.body;

        if (!targetPots || targetPots < 1) {
            return res.status(400).json({
                error: 'Se requiere una cantidad válida de macetas (targetPots >= 1)'
            });
        }

        const result = calculateDosage(parseInt(targetPots));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/simulate/validate-mix
 * Valida si una relación de mezcla es correcta
 */
router.post('/validate-mix', (req, res) => {
    try {
        const { eggshell, alginate } = req.body;

        if (!eggshell || !alginate) {
            return res.status(400).json({
                error: 'Se requieren gramos de cáscara de huevo y alginato'
            });
        }

        const result = validateMixRatio(parseFloat(eggshell), parseFloat(alginate));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/simulate/staff
 * Calcula la distribución óptima de personal
 */
router.post('/staff', (req, res) => {
    try {
        const { targetPots, hoursAvailable, staffCount, moldsAvailable } = req.body;

        if (!targetPots || !hoursAvailable) {
            return res.status(400).json({
                error: 'Se requiere cantidad de macetas y horas disponibles'
            });
        }

        const allocation = allocateStaff(
            parseInt(targetPots),
            parseFloat(hoursAvailable),
            parseInt(staffCount) || 11,
            parseInt(moldsAvailable) || 5
        );

        const schedule = generateSchedule(allocation);

        res.json({
            ...allocation,
            schedule
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/simulate/tray
 * Optimiza la distribución en el deshidratador
 */
router.post('/tray', (req, res) => {
    try {
        const { potsToPlace, maximizeTrays, traysAvailable, traySpacing } = req.body;

        if (!potsToPlace || potsToPlace < 1) {
            return res.status(400).json({
                error: 'Se requiere una cantidad válida de macetas'
            });
        }

        const result = optimizeTrayDistribution(
            parseInt(potsToPlace),
            Boolean(maximizeTrays),
            parseInt(traysAvailable) || 4,
            parseInt(traySpacing) || 2
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/simulate/full
 * Simulación completa del ciclo productivo
 */
/**
 * POST /api/simulate/full
 * Simulación completa del ciclo productivo
 */
router.post('/full', (req, res) => {
    try {
        const { targetPots, hoursAvailable, staffCount, maximizeTrays, traysAvailable, moldsAvailable, traySpacing, optimizationMode, grindGrams, grindMins } = req.body;

        if (!targetPots || !hoursAvailable) {
            return res.status(400).json({
                error: 'Se requiere cantidad de macetas y horas disponibles'
            });
        }

        const pots = parseInt(targetPots);
        const hours = parseFloat(hoursAvailable);
        const staff = parseInt(staffCount) || 11;
        
        // 1. Ejecutar cálculos de dependencias
        const dosage = calculateDosage(pots);

        const tray = optimizeTrayDistribution(
            pots,
            Boolean(maximizeTrays),
            parseInt(traysAvailable) || 4,
            parseInt(traySpacing) || 2,
            optimizationMode || 'balanced'
        );

        const totalBakingMinutes = (tray.bakingInfo?.totalBakingHours || 4) * 60;

        const staffAlloc = allocateStaff(
            pots,
            hours,
            staff,
            parseInt(moldsAvailable) || 5,
            totalBakingMinutes,
            parseFloat(grindGrams) || 4800,
            parseFloat(grindMins) || 45
        );
        
        const schedule = generateSchedule(staffAlloc);

        // 2. CÁLCULO ESTRICTO DE EQUIPOS PARA EL RESUMEN
        const T = hours * 60;
        const gCapacity = ((parseFloat(grindGrams) || 4800) / (parseFloat(grindMins) || 45)) * T;
        const grindersNeeded = Math.max(1, Math.ceil((pots * 168) / (gCapacity || 1)));
        
        // Regla: Mezcladores = Personal Total - Molineros - 1 Pesador - 1 Desmoldador
        const mixersCount = Math.max(1, staff - grindersNeeded - 2);

        // Creamos el objeto tools que el frontend necesita para dibujar la tarjeta
        const tools = {
            molds: parseInt(moldsAvailable) || 5,
            bowls: mixersCount, // 1 Bowl por cada persona mezclando
            scales: 1,
            grinders: grindersNeeded
        };

        // 3. Recopilar Alertas
        const allAlerts = [
            ...dosage.alerts,
            ...staffAlloc.alerts
        ];

        if (tray.alerts && tray.alerts.length > 0) {
            allAlerts.push(...tray.alerts);
        }

        if (!tray.success && tray.error) {
            allAlerts.push({ type: 'error', message: tray.error });
            if (tray.recommendation) {
                allAlerts.push({ type: 'info', message: tray.recommendation });
            }
        }

        const isOverallViable = staffAlloc.feasibility.isViable && tray.success;

        // 4. Enviar Respuesta Completa
        res.json({
            simulation: {
                targetPots: pots,
                hoursAvailable: hours,
                timestamp: new Date().toISOString()
            },
            dosage,
            staffAllocation: staffAlloc,
            schedule,
            trayDistribution: tray,
            tools, // <--- INYECTAMOS LAS HERRAMIENTAS AQUÍ
            summary: {
                isViable: isOverallViable,
                viabilityReason: !isOverallViable
                    ? (!staffAlloc.feasibility.isViable
                        ? `Tiempo insuficiente: necesita ${staffAlloc.feasibility.totalCycleTime}h, disponible ${hoursAvailable}h`
                        : tray.error || 'Capacidad del deshidratador excedida')
                    : 'Producción viable',
                totalAlerts: allAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/simulate/optimize
 * Sugiere recursos óptimos para una cantidad de macetas
 */
router.post('/optimize', (req, res) => {
    try {
        const { targetPots, hoursAvailable, grindGrams, grindMins } = req.body;
        res.json(calculateOptimalResources(parseInt(targetPots), parseFloat(hoursAvailable), parseFloat(grindGrams), parseFloat(grindMins)));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
