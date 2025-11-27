// Types para o MecSentinel

export type MaintenanceStatus = "normal" | "attention" | "critical"

export type MaintenanceType = "oil" | "tires" | "brakes" | "battery"

export interface MaintenanceItem {
  type: MaintenanceType
  name: string
  status: MaintenanceStatus
  daysRemaining: number
  kmRemaining: number
  lastChange: {
    date?: Date
    km?: number
  }
  nextChange: {
    estimatedDate: Date
    estimatedKm: number
  }
  interval: {
    months: number
    km: number
  }
  description: string
}

export interface Vehicle {
  id: string
  type: string // Carro, Moto, Outro
  model: string
  year: string
  isZeroKm: boolean
  currentKm: number
  usageType: "city" | "highway" | "mixed"
  averageKmPerMonth: number
  maintenanceHistory: MaintenanceItem[]
}

export interface Alert {
  id: string
  type: MaintenanceType
  severity: "info" | "warning" | "critical"
  message: string
  createdAt: Date
  seen: boolean
}

export interface MaintenanceRule {
  type: MaintenanceType
  name: string
  intervalMonths: number
  intervalKm: number
  description: string
  aiSuggested: boolean
  userAdjusted: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Tipos de autenticação e banco de dados
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  subscription_status: 'active' | 'inactive' | 'trial'
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface VehicleDB {
  id: string
  user_id: string
  type: string
  model: string
  year: string
  is_zero_km: boolean
  current_km: number
  usage_type: 'city' | 'highway' | 'mixed'
  average_km_per_month: number
  created_at: string
  updated_at: string
}

export interface MaintenanceHistoryDB {
  id: string
  vehicle_id: string
  maintenance_type: 'oil' | 'tires' | 'brakes' | 'battery' | 'other'
  maintenance_name: string
  performed_at_date: string | null
  performed_at_km: number | null
  notes: string | null
  created_at: string
}
