import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('⚠️ Variáveis de ambiente do Supabase não configuradas. Verifique o arquivo .env')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export type Database = {
  profiles: {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    subscription_status: 'active' | 'inactive' | 'trial'
    subscription_plan: 'basic' | 'premium' | 'enterprise'
    created_at: string
    updated_at: string
  }
  vehicles: {
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
  maintenance_history: {
    id: string
    vehicle_id: string
    maintenance_type: 'oil' | 'tires' | 'brakes' | 'battery' | 'other'
    maintenance_name: string
    performed_at_date: string | null
    performed_at_km: number | null
    notes: string | null
    created_at: string
  }
  maintenance_rules: {
    id: string
    vehicle_id: string
    maintenance_type: 'oil' | 'tires' | 'brakes' | 'battery' | 'other'
    maintenance_name: string
    interval_months: number
    interval_km: number
    description: string | null
    ai_suggested: boolean
    user_adjusted: boolean
    created_at: string
    updated_at: string
  }
  alerts: {
    id: string
    vehicle_id: string
    maintenance_type: 'oil' | 'tires' | 'brakes' | 'battery' | 'other'
    severity: 'info' | 'warning' | 'critical'
    message: string
    seen: boolean
    created_at: string
  }
  chat_conversations: {
    id: string
    user_id: string
    vehicle_id: string | null
    title: string | null
    created_at: string
    updated_at: string
  }
  chat_messages: {
    id: string
    conversation_id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
  }
}
