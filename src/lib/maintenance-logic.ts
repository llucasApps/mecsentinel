// Lógica de cálculo de manutenção

import { MaintenanceItem, MaintenanceStatus, MaintenanceType, Vehicle } from "./types"

// Regras padrão de manutenção (podem ser ajustadas pela IA)
export const DEFAULT_MAINTENANCE_INTERVALS = {
  oil: { months: 6, km: 10000 },
  tires: { months: 48, km: 60000 },
  brakes: { months: 24, km: 40000 },
  battery: { months: 36, km: 0 }, // Bateria é baseada apenas em tempo
}

export const MAINTENANCE_NAMES = {
  oil: "Óleo do motor",
  tires: "Pneus",
  brakes: "Pastilhas de freio",
  battery: "Bateria",
}

export const MAINTENANCE_DESCRIPTIONS = {
  oil: "Essencial para lubrificação e proteção do motor",
  tires: "Garantem segurança e aderência ao solo",
  brakes: "Fundamentais para a segurança do veículo",
  battery: "Fornece energia para partida e sistemas elétricos",
}

// Calcula o status de uma manutenção
export function calculateMaintenanceStatus(
  daysRemaining: number,
  kmRemaining: number
): MaintenanceStatus {
  // Crítico: menos de 7 dias OU menos de 500km
  if (daysRemaining <= 7 || kmRemaining <= 500) {
    return "critical"
  }
  
  // Atenção: menos de 30 dias OU menos de 2000km
  if (daysRemaining <= 30 || kmRemaining <= 2000) {
    return "attention"
  }
  
  return "normal"
}

// Calcula quando será a próxima manutenção
export function calculateNextMaintenance(
  lastChangeDate: Date | undefined,
  lastChangeKm: number | undefined,
  currentKm: number,
  intervalMonths: number,
  intervalKm: number,
  averageKmPerMonth: number
): { estimatedDate: Date; estimatedKm: number; daysRemaining: number; kmRemaining: number } {
  const now = new Date()
  
  // Calcula próxima data baseada em meses
  let estimatedDate = new Date(now)
  if (lastChangeDate) {
    estimatedDate = new Date(lastChangeDate)
    estimatedDate.setMonth(estimatedDate.getMonth() + intervalMonths)
  } else {
    estimatedDate.setMonth(estimatedDate.getMonth() + intervalMonths)
  }
  
  // Calcula próximo KM
  const baseKm = lastChangeKm !== undefined ? lastChangeKm : currentKm
  const estimatedKm = baseKm + intervalKm
  
  // Calcula dias restantes
  const daysRemaining = Math.floor((estimatedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calcula KM restantes
  const kmRemaining = estimatedKm - currentKm
  
  return {
    estimatedDate,
    estimatedKm,
    daysRemaining: Math.max(0, daysRemaining),
    kmRemaining: Math.max(0, kmRemaining),
  }
}

// Gera os itens de manutenção para um veículo
export function generateMaintenanceItems(
  vehicle: Vehicle,
  maintenanceHistory: {
    oil?: { date?: Date; km?: number }
    tires?: { date?: Date; km?: number }
    brakes?: { date?: Date; km?: number }
    battery?: { date?: Date; km?: number }
  }
): MaintenanceItem[] {
  const items: MaintenanceItem[] = []
  
  const types: MaintenanceType[] = ["oil", "tires", "brakes", "battery"]
  
  types.forEach((type) => {
    const interval = DEFAULT_MAINTENANCE_INTERVALS[type]
    const lastChange = maintenanceHistory[type]
    
    const nextMaintenance = calculateNextMaintenance(
      lastChange?.date,
      lastChange?.km,
      vehicle.currentKm,
      interval.months,
      interval.km,
      vehicle.averageKmPerMonth
    )
    
    const status = calculateMaintenanceStatus(
      nextMaintenance.daysRemaining,
      nextMaintenance.kmRemaining
    )
    
    items.push({
      type,
      name: MAINTENANCE_NAMES[type],
      status,
      daysRemaining: nextMaintenance.daysRemaining,
      kmRemaining: nextMaintenance.kmRemaining,
      lastChange: {
        date: lastChange?.date,
        km: lastChange?.km,
      },
      nextChange: {
        estimatedDate: nextMaintenance.estimatedDate,
        estimatedKm: nextMaintenance.estimatedKm,
      },
      interval,
      description: MAINTENANCE_DESCRIPTIONS[type],
    })
  })
  
  return items
}

// Encontra a manutenção mais urgente
export function getMostUrgentMaintenance(items: MaintenanceItem[]): MaintenanceItem | null {
  if (items.length === 0) return null
  
  // Prioriza por status crítico, depois atenção, depois menor tempo/km
  const sorted = [...items].sort((a, b) => {
    // Prioridade de status
    const statusPriority = { critical: 3, attention: 2, normal: 1 }
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[b.status] - statusPriority[a.status]
    }
    
    // Se mesmo status, ordena por menor tempo ou km
    const aMin = Math.min(a.daysRemaining, a.kmRemaining / 50) // Normaliza km para comparação
    const bMin = Math.min(b.daysRemaining, b.kmRemaining / 50)
    return aMin - bMin
  })
  
  return sorted[0]
}

// Calcula média de KM por mês baseado em uso
export function calculateAverageKmPerMonth(usageType: "city" | "highway" | "mixed"): number {
  const averages = {
    city: 800,
    highway: 2000,
    mixed: 1200,
  }
  return averages[usageType]
}

// Gera mensagem de alerta personalizada
export function generateAlertMessage(item: MaintenanceItem): string {
  if (item.status === "critical") {
    return `⚠️ URGENTE: ${item.name} precisa de atenção imediata! Restam apenas ${item.daysRemaining} dias ou ${item.kmRemaining}km.`
  }
  
  if (item.status === "attention") {
    return `⚡ ATENÇÃO: ${item.name} se aproxima do prazo de troca. Restam ${item.daysRemaining} dias ou ${item.kmRemaining}km.`
  }
  
  return `✅ ${item.name} está em dia. Próxima troca em ${item.daysRemaining} dias ou ${item.kmRemaining}km.`
}
