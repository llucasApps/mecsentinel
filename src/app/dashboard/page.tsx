"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Car, 
  Droplet, 
  CircleDot, 
  Disc, 
  Battery, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Gauge,
  Heart,
  MessageCircle,
  Settings,
  Calendar,
  TrendingUp
} from "lucide-react"
import { Vehicle, MaintenanceItem } from "@/lib/types"
import { generateMaintenanceItems, getMostUrgentMaintenance } from "@/lib/maintenance-logic"
import UpdateKmModal from "./components/UpdateKmModal"
import VehicleHealthModal from "./components/VehicleHealthModal"
import MechanicChatModal from "./components/MechanicChatModal"
import MaintenanceRulesModal from "./components/MaintenanceRulesModal"

interface DashboardProps {
  vehicle: Vehicle
  quizData: any
}

export default function Dashboard({ vehicle: initialVehicle, quizData }: DashboardProps) {
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle)
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([])
  const [showUpdateKm, setShowUpdateKm] = useState(false)
  const [showHealth, setShowHealth] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showRules, setShowRules] = useState(false)

  // Gera itens de manutenção baseado nos dados do quiz
  useEffect(() => {
    const history = {
      oil: quizData.lastOilChange.type !== "not_done" ? {
        date: quizData.lastOilChange.date,
        km: quizData.lastOilChange.km ? parseInt(quizData.lastOilChange.km) : undefined
      } : undefined,
      tires: quizData.lastTireChange.type !== "not_done" ? {
        date: quizData.lastTireChange.date,
        km: quizData.lastTireChange.km ? parseInt(quizData.lastTireChange.km) : undefined
      } : undefined,
      brakes: quizData.lastBrakeChange.type !== "not_done" ? {
        date: quizData.lastBrakeChange.date,
        km: quizData.lastBrakeChange.km ? parseInt(quizData.lastBrakeChange.km) : undefined
      } : undefined,
      battery: quizData.lastBatteryChange.type !== "not_done" ? {
        date: quizData.lastBatteryChange.date,
        km: quizData.lastBatteryChange.km ? parseInt(quizData.lastBatteryChange.km) : undefined
      } : undefined,
    }

    const items = generateMaintenanceItems(vehicle, history)
    setMaintenanceItems(items)
  }, [vehicle, quizData])

  const mostUrgent = getMostUrgentMaintenance(maintenanceItems)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "attention":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-green-600 bg-green-50 border-green-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="w-5 h-5" />
      case "attention":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <CheckCircle2 className="w-5 h-5" />
    }
  }

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case "oil":
        return <Droplet className="w-6 h-6" />
      case "tires":
        return <CircleDot className="w-6 h-6" />
      case "brakes":
        return <Disc className="w-6 h-6" />
      case "battery":
        return <Battery className="w-6 h-6" />
      default:
        return <Settings className="w-6 h-6" />
    }
  }

  const handleUpdateKm = (newKm: number) => {
    setVehicle({ ...vehicle, currentKm: newKm })
    setShowUpdateKm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Car className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">MecSentinel</h1>
              <p className="text-blue-100">Monitoramento Inteligente</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-200">Veículo</p>
                <p className="font-semibold">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-blue-200">Ano</p>
                <p className="font-semibold">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-blue-200">Quilometragem</p>
                <p className="font-semibold">{vehicle.currentKm.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-blue-200">Uso</p>
                <p className="font-semibold capitalize">{vehicle.usageType === "city" ? "Cidade" : vehicle.usageType === "highway" ? "Estrada" : "Misto"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Card Principal - Próxima Manutenção Urgente */}
        {mostUrgent && (
          <Card className={`p-6 border-2 ${getStatusColor(mostUrgent.status)}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${getStatusColor(mostUrgent.status)}`}>
                {getMaintenanceIcon(mostUrgent.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(mostUrgent.status)}
                  <h2 className="text-xl font-bold">Próxima Manutenção</h2>
                </div>
                <p className="text-lg font-semibold mb-2">{mostUrgent.name}</p>
                <p className="text-sm mb-3">
                  {mostUrgent.status === "critical" 
                    ? "⚠️ URGENTE: Atenção necessária imediatamente!"
                    : mostUrgent.status === "attention"
                    ? "⚡ ATENÇÃO: Manutenção se aproximando"
                    : "✅ Tudo certo por enquanto"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{mostUrgent.daysRemaining} dias restantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span className="font-medium">{mostUrgent.kmRemaining.toLocaleString()} km restantes</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Cards Individuais de Manutenção */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {maintenanceItems.map((item) => (
            <Card key={item.type} className={`p-5 border-2 ${getStatusColor(item.status)} hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                  {getMaintenanceIcon(item.type)}
                </div>
                <h3 className="font-bold text-lg">{item.name}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={item.status === "critical" ? "destructive" : item.status === "attention" ? "default" : "secondary"}>
                    {item.status === "critical" ? "Crítico" : item.status === "attention" ? "Atenção" : "Normal"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dias restantes</span>
                  <span className="font-semibold">{item.daysRemaining}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">KM restantes</span>
                  <span className="font-semibold">{item.kmRemaining.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t pt-3">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => setShowUpdateKm(true)}
            className="h-auto py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <div className="flex flex-col items-center gap-2">
              <Gauge className="w-6 h-6" />
              <span className="font-semibold">Atualizar KM</span>
            </div>
          </Button>

          <Button
            onClick={() => setShowHealth(true)}
            className="h-auto py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-6 h-6" />
              <span className="font-semibold">Saúde do Veículo</span>
            </div>
          </Button>

          <Button
            onClick={() => setShowChat(true)}
            className="h-auto py-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="font-semibold">Mecânico 24h</span>
            </div>
          </Button>

          <Button
            onClick={() => setShowRules(true)}
            className="h-auto py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <div className="flex flex-col items-center gap-2">
              <Settings className="w-6 h-6" />
              <span className="font-semibold">Regras de Manutenção</span>
            </div>
          </Button>
        </div>

        {/* Estatísticas Rápidas */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600">
                {maintenanceItems.filter(i => i.status === "normal").length}
              </p>
              <p className="text-sm text-muted-foreground">Em dia</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-3xl font-bold text-orange-600">
                {maintenanceItems.filter(i => i.status === "attention").length}
              </p>
              <p className="text-sm text-muted-foreground">Atenção</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-3xl font-bold text-red-600">
                {maintenanceItems.filter(i => i.status === "critical").length}
              </p>
              <p className="text-sm text-muted-foreground">Crítico</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">
                {vehicle.averageKmPerMonth}
              </p>
              <p className="text-sm text-muted-foreground">KM/mês</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      {showUpdateKm && (
        <UpdateKmModal
          currentKm={vehicle.currentKm}
          onClose={() => setShowUpdateKm(false)}
          onUpdate={handleUpdateKm}
        />
      )}

      {showHealth && (
        <VehicleHealthModal
          vehicle={vehicle}
          maintenanceItems={maintenanceItems}
          onClose={() => setShowHealth(false)}
        />
      )}

      {showChat && (
        <MechanicChatModal
          vehicle={vehicle}
          onClose={() => setShowChat(false)}
        />
      )}

      {showRules && (
        <MaintenanceRulesModal
          vehicle={vehicle}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}
