/**
 * EcoLlajta Smart-Twin - Constantes de Producción
 * Datos extraídos de los informes de producción Fase II
 */

const PRODUCTION_CONSTANTS = {
    // Relación de mezcla (Regla de Oro 10:1)
    RATIO: {
        EGGSHELL_GRAMS: 180,      // gramos de cáscara de huevo por unidad
        ALGINATE_GRAMS: 18,       // gramos de alginato por unidad
        WATER_ML: 140,            // mililitros de agua por preparación
        RATIO_VALUE: 10           // relación 10:1
    },

    // Tiempos del proceso (en minutos)
    TIMES: {
        WET_MIXING_MIN: 5,        // tiempo de mezcla húmeda
        MOLD_REST_MIN: 5,         // tiempo de reposo en molde (optimizado)
        PREP_PER_BATCH_MIN: 1.22, // tiempo de preparación por lote de 3
        BAKING_TOTAL_MIN: 240,    // tiempo total de horneado (4 horas)
        BAKING_FLIP_MIN: 120,     // punto crítico para volteo (2 horas)
        PRECALENTADO_MIN: 30      // precalentamiento del horno
    },

    // Capacidades del deshidratador
    DEHYDRATOR: {
        TRAYS_AVAILABLE: 4,       // charolas disponibles
        CAPACITY_PER_TRAY: 40,    // macetas por charola (5x8)
        GRID_ROWS: 5,             // filas de la cuadrícula
        GRID_COLS: 8,             // columnas de la cuadrícula
        TEMPERATURE_CELSIUS: 45   // temperatura de horneado
    },

    // Indicadores de rendimiento
    PERFORMANCE: {
        PRODUCTION_RATE: 28.9,    // macetas por hora
        DEFECT_RATE: 0.0455,      // tasa de defectos (4.55%)
        MATERIAL_YIELD: 0.9315,   // rendimiento del material (93.15%)
        COST_PER_UNIT_BS: 5.12    // costo unitario en bolivianos
    },

    // Restricciones del sistema
    CONSTRAINTS: {
        MAX_POTS_PER_GROUP: 20,   // máximo antes de penalizar evaporación
        TYPICAL_WASTE_GRAMS: 400, // merma típica (340-447g)
        STAFF_AVAILABLE: 11       // integrantes del grupo
    },

    // Estaciones de trabajo
    STATIONS: {
        MOLIENDA: { name: 'Molienda', minStaff: 1, maxStaff: 3 },
        DOSIFICACION: { name: 'Dosificación', minStaff: 1, maxStaff: 2 },
        MEZCLADO: { name: 'Mezclado', minStaff: 2, maxStaff: 4 },
        MOLDEADO: { name: 'Moldeado', minStaff: 2, maxStaff: 4 },
        HORNEADO: { name: 'Horneado', minStaff: 1, maxStaff: 2 }
    }
};

module.exports = PRODUCTION_CONSTANTS;
