"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Heart, Loader2, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Vehicle, MaintenanceItem } from "@/lib/types"
import { analyzeVehicleHealth } from "@/lib/openai"

interface VehicleHealthModalProps {
  vehicle: Vehicle
  maintenanceItems: MaintenanceItem[]
  onClose: () => void
}

export default function VehicleHealthModal({ vehicle, maintenanceItems, onClose }: VehicleHealthModalProps) {
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState<{
    overallHealth: "excellent" | "good" | "attention" | "critical"
    summary: string
    recommendations: string[]
    attentionPoints: string[]
  } | null>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true)
      const data = await analyzeVehicleHealth({
        type: vehicle.type,
        model: vehicle.model,
        year: vehicle.year,
        currentKm: vehicle.currentKm,
        usageType: vehicle.usageType,
        maintenanceItems: maintenanceItems.map(item => ({
          name: item.name,
          status: item.status,
          daysRemaining: item.daysRemaining,
          kmRemaining: item.kmRemaining,
        })),
      })
      setHealthData(data)
      setLoading(false)
    }

    fetchHealth()
  }, [vehicle, maintenanceItems])

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200"
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "attention":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "excellent":
        return <CheckCircle2 className="w-8 h-8" />
      case "good":
        return <CheckCircle2 className="w-8 h-8" />
      case "attention":
        return <AlertCircle className="w-8 h-8" />
      case "critical":
        return <AlertTriangle className="w-8 h-8" />
      default:
        return <Heart className="w-8 h-8" />
    }
  }

  const getHealthLabel = (health: string) => {
    switch (health) {
      case "excellent":
        return "Excelente"
      case "good":
        return "Boa"
      case "attention":
        return "Atenção Necessária"
      case "critical":
        return "Crítico"
      default:
        return "Analisando..."
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Saúde do Veículo
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-muted-foreground">Analisando saúde do veículo com IA...</p>
          </div>
        ) : healthData ? (
          <div className="space-y-6">
            {/* Status Geral */}
            <Card className={`p-6 border-2 ${getHealthColor(healthData.overallHealth)}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${getHealthColor(healthData.overallHealth)}`}>
                  {getHealthIcon(healthData.overallHealth)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Geral</p>
                  <h3 className="text-2xl font-bold">{getHealthLabel(healthData.overallHealth)}</h3>
                </div>
              </div>
              <p className="text-base leading-relaxed">{healthData.summary}</p>
            </Card>

            {/* Pontos de Atenção */}
            {healthData.attentionPoints.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Pontos de Atenção
                </h3>
                <div className="space-y-2">
                  {healthData.attentionPoints.map((point, index) => (
                    <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-lg">
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Recomendações
              </h3>
              <div className="space-y-2">
                {healthData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Itens Básicos de Manutenção */}
            <div>
              <h3 className="text-lg font-bold mb-3">Status dos Itens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {maintenanceItems.map((item) => (
                  <div key={item.type} className={`p-4 border-2 rounded-lg ${getHealthColor(item.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{item.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getHealthColor(item.status)}`}>
                        {item.status === "critical" ? "Crítico" : item.status === "attention" ? "Atenção" : "Normal"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.daysRemaining} dias ou {item.kmRemaining.toLocaleString()} km
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Não foi possível carregar os dados de saúde.</p>
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg"
        >
          Fechar
        </Button>
      </Card>
    </div>
  )
}
