"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Settings, Loader2, Sparkles, Edit2, Check } from "lucide-react"
import { Vehicle, MaintenanceRule } from "@/lib/types"
import { generateMaintenanceRules } from "@/lib/openai"
import { DEFAULT_MAINTENANCE_INTERVALS, MAINTENANCE_NAMES } from "@/lib/maintenance-logic"

interface MaintenanceRulesModalProps {
  vehicle: Vehicle
  onClose: () => void
}

export default function MaintenanceRulesModal({ vehicle, onClose }: MaintenanceRulesModalProps) {
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<MaintenanceRule[]>([])
  const [explanation, setExplanation] = useState("")
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ months: number; km: number }>({ months: 0, km: 0 })

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true)
      
      try {
        const aiRules = await generateMaintenanceRules({
          type: vehicle.type,
          model: vehicle.model,
          year: vehicle.year,
          currentKm: vehicle.currentKm,
          usageType: vehicle.usageType,
        })

        const rulesData: MaintenanceRule[] = [
          {
            type: "oil",
            name: MAINTENANCE_NAMES.oil,
            intervalMonths: aiRules.oil.months,
            intervalKm: aiRules.oil.km,
            description: "Troca de óleo e filtro",
            aiSuggested: true,
            userAdjusted: false,
          },
          {
            type: "tires",
            name: MAINTENANCE_NAMES.tires,
            intervalMonths: aiRules.tires.months,
            intervalKm: aiRules.tires.km,
            description: "Troca de pneus",
            aiSuggested: true,
            userAdjusted: false,
          },
          {
            type: "brakes",
            name: MAINTENANCE_NAMES.brakes,
            intervalMonths: aiRules.brakes.months,
            intervalKm: aiRules.brakes.km,
            description: "Troca de pastilhas de freio",
            aiSuggested: true,
            userAdjusted: false,
          },
          {
            type: "battery",
            name: MAINTENANCE_NAMES.battery,
            intervalMonths: aiRules.battery.months,
            intervalKm: 0,
            description: "Troca de bateria (baseado apenas em tempo)",
            aiSuggested: true,
            userAdjusted: false,
          },
        ]

        setRules(rulesData)
        setExplanation(aiRules.explanation)
      } catch (error) {
        console.error("Error fetching rules:", error)
        // Fallback para regras padrão
        const defaultRules: MaintenanceRule[] = [
          {
            type: "oil",
            name: MAINTENANCE_NAMES.oil,
            intervalMonths: DEFAULT_MAINTENANCE_INTERVALS.oil.months,
            intervalKm: DEFAULT_MAINTENANCE_INTERVALS.oil.km,
            description: "Troca de óleo e filtro",
            aiSuggested: false,
            userAdjusted: false,
          },
          {
            type: "tires",
            name: MAINTENANCE_NAMES.tires,
            intervalMonths: DEFAULT_MAINTENANCE_INTERVALS.tires.months,
            intervalKm: DEFAULT_MAINTENANCE_INTERVALS.tires.km,
            description: "Troca de pneus",
            aiSuggested: false,
            userAdjusted: false,
          },
          {
            type: "brakes",
            name: MAINTENANCE_NAMES.brakes,
            intervalMonths: DEFAULT_MAINTENANCE_INTERVALS.brakes.months,
            intervalKm: DEFAULT_MAINTENANCE_INTERVALS.brakes.km,
            description: "Troca de pastilhas de freio",
            aiSuggested: false,
            userAdjusted: false,
          },
          {
            type: "battery",
            name: MAINTENANCE_NAMES.battery,
            intervalMonths: DEFAULT_MAINTENANCE_INTERVALS.battery.months,
            intervalKm: 0,
            description: "Troca de bateria (baseado apenas em tempo)",
            aiSuggested: false,
            userAdjusted: false,
          },
        ]
        setRules(defaultRules)
        setExplanation("Usando intervalos padrão recomendados para seu tipo de veículo.")
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [vehicle])

  const handleEdit = (ruleType: string) => {
    const rule = rules.find(r => r.type === ruleType)
    if (rule) {
      setEditingRule(ruleType)
      setEditValues({ months: rule.intervalMonths, km: rule.intervalKm })
    }
  }

  const handleSave = (ruleType: string) => {
    setRules(rules.map(rule => 
      rule.type === ruleType 
        ? { 
            ...rule, 
            intervalMonths: editValues.months, 
            intervalKm: editValues.km,
            userAdjusted: true 
          }
        : rule
    ))
    setEditingRule(null)
  }

  const handleCancel = () => {
    setEditingRule(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            Regras de Manutenção
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
            <p className="text-lg text-muted-foreground">Gerando regras personalizadas com IA...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Explicação da IA */}
            <Card className="p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Análise Personalizada</h3>
                  <p className="text-sm leading-relaxed">{explanation}</p>
                </div>
              </div>
            </Card>

            {/* Regras */}
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.type} className="p-5 border-2 hover:border-orange-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{rule.name}</h3>
                        {rule.aiSuggested && (
                          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                            IA Sugerida
                          </span>
                        )}
                        {rule.userAdjusted && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            Ajustada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    
                    {editingRule !== rule.type && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule.type)}
                        className="flex-shrink-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {editingRule === rule.type ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${rule.type}-months`}>Intervalo em meses</Label>
                          <Input
                            id={`${rule.type}-months`}
                            type="number"
                            value={editValues.months}
                            onChange={(e) => setEditValues({ ...editValues, months: parseInt(e.target.value) || 0 })}
                            className="mt-2"
                          />
                        </div>
                        {rule.type !== "battery" && (
                          <div>
                            <Label htmlFor={`${rule.type}-km`}>Intervalo em KM</Label>
                            <Input
                              id={`${rule.type}-km`}
                              type="number"
                              value={editValues.km}
                              onChange={(e) => setEditValues({ ...editValues, km: parseInt(e.target.value) || 0 })}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSave(rule.type)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Intervalo de tempo</p>
                        <p className="text-lg font-bold text-blue-600">{rule.intervalMonths} meses</p>
                      </div>
                      {rule.type !== "battery" && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Intervalo de KM</p>
                          <p className="text-lg font-bold text-green-600">{rule.intervalKm.toLocaleString()} km</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Dica:</strong> As regras sugeridas pela IA são baseadas no seu veículo e tipo de uso. 
                Você pode ajustá-las manualmente se preferir intervalos diferentes.
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-6 text-lg"
        >
          Fechar
        </Button>
      </Card>
    </div>
  )
}
