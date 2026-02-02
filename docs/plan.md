# Plan Maestro: EcoLlajta Smart-Twin

## Stack Tecnológico
| Componente | Tecnología | Puerto |
|------------|------------|--------|
| Frontend | Next.js + TypeScript | 4000 |
| Backend | Express.js | 3000 |
| UI/UX | Modo Claro/Oscuro, Glassmorphism | - |

## Estructura Final del Proyecto
```
GestionPersonal/
├── frontend/                    # Next.js App (Puerto 4000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css      # Sistema de diseño premium
│   │   │   ├── layout.tsx       # Layout con metadata SEO
│   │   │   └── page.tsx         # Dashboard principal
│   │   ├── components/
│   │   │   ├── TrayVisualizer.tsx    # Grid visual del deshidratador
│   │   │   ├── TimelineSchedule.tsx  # Cronograma de rotación
│   │   │   ├── StaffChart.tsx        # Gráfico de personal
│   │   │   ├── DosageCard.tsx        # Tarjeta de dosificación
│   │   │   └── AlertsPanel.tsx       # Panel de alertas
│   │   ├── lib/
│   │   │   └── api.ts           # Servicio de comunicación con backend
│   │   └── types/
│   │       └── index.ts         # Tipos TypeScript
│   └── .env.local               # NEXT_PUBLIC_API_URL
│
├── backend/                     # Express API (Puerto 3000)
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.js     # Constantes de producción
│   │   ├── logic/
│   │   │   ├── dosageCalculator.js   # Motor de dosificación
│   │   │   ├── staffAllocator.js     # Motor de personal
│   │   │   └── trayOptimizer.js      # Optimizador de bandejas
│   │   ├── routes/
│   │   │   └── simulate.js      # Rutas de la API
│   │   └── server.js            # Servidor Express
│   └── .env                     # PORT=3000, DATABASE_URL
│
└── docs/
    └── plan.md                  # Este archivo
```

## Datos de Producción (Extraídos de Informes)

### Constantes del Proceso
| Variable | Valor |
|----------|-------|
| Relación Huevo:Alginato | **10:1** (180g / 18g) |
| Agua por preparación | **140 ml** |
| Tiempo de horneado TOTAL | **4-5 horas** |
| Punto crítico (volteo) | **2 horas** |
| Capacidad por charola | **40 macetas** (5×8) |
| Charolas disponibles | **4** |
| Costo unitario | **5.12 Bs/maceta** |
| Tasa de defectos | **4.55%** |

## Comandos para Ejecutar

### Backend (Puerto 3000)
```bash
cd backend
npm run dev
```

### Frontend (Puerto 4000)
```bash
cd frontend
npm run dev
```

## Endpoints de la API
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/simulate/dosage` | Cálculo de insumos |
| POST | `/api/simulate/staff` | Asignación de personal |
| POST | `/api/simulate/tray` | Distribución en bandejas |
| POST | `/api/simulate/full` | Simulación completa |

## Estado ✅
- [x] Backend con motor de lógica completo
- [x] Frontend con Dashboard interactivo
- [x] Visualización de bandejas del deshidratador
- [x] Sistema de alertas y validaciones
- [x] Modo Claro/Oscuro
- [x] Diseño premium con Glassmorphism
