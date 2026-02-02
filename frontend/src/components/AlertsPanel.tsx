'use client';

import { Alert } from '@/types';

interface AlertsPanelProps {
    alerts: Alert[];
    title?: string;
}

export default function AlertsPanel({ alerts, title = 'Alertas del Sistema' }: AlertsPanelProps) {
    if (alerts.length === 0) return null;

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error': return '⛔';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'error':
                return 'bg-red-500/10 border-red-500/30 text-red-500';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
            case 'success':
                return 'bg-green-500/10 border-green-500/30 text-green-500';
            default:
                return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
        }
    };

    // Ordenar por prioridad: error > warning > info > success
    const sortedAlerts = [...alerts].sort((a, b) => {
        const priority: Record<string, number> = { error: 0, warning: 1, info: 2, success: 3 };
        return (priority[a.type] || 4) - (priority[b.type] || 4);
    });

    return (
        <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🔔</span>
                {title}
                <span className="badge badge-info ml-auto">{alerts.length}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sortedAlerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`
              flex items-start gap-3 p-4 rounded-lg border
              ${getAlertStyles(alert.type)}
              animate-fade-in
            `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <span className="text-xl flex-shrink-0">{getAlertIcon(alert.type)}</span>
                        <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
