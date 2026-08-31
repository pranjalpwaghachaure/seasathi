// src/lib/api.ts
export interface AdvisoryRequest {
  query?: string;
  latitude?: number;
  longitude?: number;
}

export interface DirectVerdict {
  overall_status: string;
  fishing_potential: string;
  pfz_probability: number;
  sea_safety: string;
  legal_status: string;
}

export interface ConditionsAnalysis {
  sea_surface_temp_c: number;
  chlorophyll_a: number;
  wave_height_m: number;
  wind_speed_kmh: number;
  cyclone_alert: string;
}

export interface SafetyBoundary {
  eez_compliant: boolean;
  imbl_distance_km: number;
  imbl_sector: string;
  geofence_warning: string;
  safe_buffer_km: number;
}

export interface MarineAdvisoryResponse {
  latitude: number;
  longitude: number;
  verdict: DirectVerdict;
  conditions: ConditionsAnalysis;
  safety: SafetyBoundary;
  raw_markdown_report: string;
}

const API_BASE_URL = typeof window !== 'undefined' && (window as any).__VITE_API_URL__ 
  ? (window as any).__VITE_API_URL__ 
  : 'http://localhost:8000';

export async function fetchMarineAdvisory(payload: AdvisoryRequest): Promise<MarineAdvisoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/advisory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}