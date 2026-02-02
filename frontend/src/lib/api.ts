import { SimulationParams, FullSimulationResult, DosageResult, StaffResult, TrayResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function runFullSimulation(params: SimulationParams): Promise<FullSimulationResult> {
    const response = await fetch(`${API_URL}/api/simulate/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Error en la simulación');
    }

    return response.json();
}

export async function getDosage(targetPots: number): Promise<DosageResult> {
    const response = await fetch(`${API_URL}/api/simulate/dosage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPots }),
    });

    return response.json();
}

export async function getStaffAllocation(
    targetPots: number,
    hoursAvailable: number,
    staffCount: number
): Promise<StaffResult> {
    const response = await fetch(`${API_URL}/api/simulate/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPots, hoursAvailable, staffCount }),
    });

    return response.json();
}

export async function getTrayOptimization(potsToPlace: number): Promise<TrayResult> {
    const response = await fetch(`${API_URL}/api/simulate/tray`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ potsToPlace }),
    });

    return response.json();
}

export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}
