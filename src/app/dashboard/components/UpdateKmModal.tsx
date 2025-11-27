"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Gauge, Calendar, TrendingUp } from "lucide-react"

interface UpdateKmModalProps {
  currentKm: number
  onClose: () => void
  onUpdate: (newKm: number) => void
}

export default function UpdateKmModal({ currentKm, onClose, onUpdate }: UpdateKmModalProps) {
  const [updateType, setUpdateType] = useState<"monthly" | "odometer">("odometer")
  const [monthlyKm, setMonthlyKm] = useState("")
  const [odometerKm, setOdometerKm] = useState("")

  const handleUpdate = () => {
    if (updateType === "monthly" && monthlyKm) {
      const newKm = currentKm + parseInt(monthlyKm)
      onUpdate(newKm)
    } else if (updateType === "odometer" && odometerKm) {
      onUpdate(parseInt(odometerKm))
    }
  }

  const canUpdate = 
    (updateType === "monthly" && monthlyKm && parseInt(monthlyKm) > 0) ||
    (updateType === "odometer" && odometerKm && parseInt(odometerKm) > currentKm)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-600" />
            Atualizar Quilometragem
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">Quilometragem atual</p>
          <p className="text-2xl font-bold text-blue-600">{currentKm.toLocaleString()} km</p>
        </div>

        <div className="space-y-6">
          {/* Opção 1: Atualização Mensal */}
          <div 
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
              updateType === "monthly" 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setUpdateType("monthly")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${updateType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Atualização Mensal</h3>
                <p className="text-sm text-muted-foreground">Estimar KM rodados no último mês</p>
              </div>
            </div>
            
            {updateType === "monthly" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Label htmlFor="monthly-km">Quantos KM você rodou no último mês?</Label>
                <Input
                  id="monthly-km"
                  type="number"
                  placeholder="Ex: 1200"
                  value={monthlyKm}
                  onChange={(e) => setMonthlyKm(e.target.value)}
                  className="text-lg p-6"
                />
                {monthlyKm && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Nova quilometragem será:</p>
                    <p className="text-xl font-bold text-green-600">
                      {(currentKm + parseInt(monthlyKm)).toLocaleString()} km
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opção 2: Hodômetro */}
          <div 
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
              updateType === "odometer" 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setUpdateType("odometer")}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${updateType === "odometer" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Hodômetro Atual</h3>
                <p className="text-sm text-muted-foreground">Insira a quilometragem exata do painel</p>
              </div>
            </div>
            
            {updateType === "odometer" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Label htmlFor="odometer-km">Qual a quilometragem atual no hodômetro?</Label>
                <Input
                  id="odometer-km"
                  type="number"
                  placeholder={`Ex: ${currentKm + 500}`}
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="text-lg p-6"
                />
                {odometerKm && parseInt(odometerKm) > currentKm && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença:</p>
                    <p className="text-xl font-bold text-green-600">
                      +{(parseInt(odometerKm) - currentKm).toLocaleString()} km
                    </p>
                  </div>
                )}
                {odometerKm && parseInt(odometerKm) <= currentKm && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600">
                      ⚠️ A nova quilometragem deve ser maior que a atual
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-6 text-lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!canUpdate}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg"
          >
            Atualizar
          </Button>
        </div>
      </Card>
    </div>
  )
}
