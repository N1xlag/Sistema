/**
 * EcoLlajta Smart-Twin - Servidor Express
 * Puerto: 3000
 */

require('dotenv').config();
console.log('🔄 Reiniciando backend...');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const simulateRoutes = require('./routes/simulate');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: ['http://localhost:4000', 'http://127.0.0.1:4000'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'EcoLlajta Smart-Twin API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rutas de simulación
app.use('/api/simulate', simulateRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        availableEndpoints: [
            'GET /api/health',
            'POST /api/simulate/dosage',
            'POST /api/simulate/validate-mix',
            'POST /api/simulate/staff',
            'POST /api/simulate/tray',
            'POST /api/simulate/full'
        ]
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     EcoLlajta Smart-Twin API                          ║
║     Simulador de Optimización de Producción           ║
╠═══════════════════════════════════════════════════════╣
║  🚀 Servidor corriendo en: http://localhost:${PORT}   ║
║  📊 Health Check: http://localhost:${PORT}/api/health ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
