"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Car, Bike, Truck, ArrowRight, ArrowLeft, CheckCircle2, Loader2, LogOut } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Dashboard from "./dashboard/page"
import { Vehicle } from "@/lib/types"
import { calculateAverageKmPerMonth } from "@/lib/maintenance-logic"
import { supabase } from "@/lib/supabase"

type MaintenanceData = {
  type: "date" | "km" | "not_done"
  date?: Date
  km?: string
}

type QuizData = {
  vehicleType: string
  vehicleModel: string
  vehicleYear: string
  isZeroKm: string
  currentKm: string
  usageType: string
  lastOilChange: MaintenanceData
  lastTireChange: MaintenanceData
  lastBrakeChange: MaintenanceData
  lastBatteryChange: MaintenanceData
}

export default function MecSentinelQuiz() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [showDashboard, setShowDashboard] = useState(false)
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [data, setData] = useState<QuizData>({
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    isZeroKm: "",
    currentKm: "",
    usageType: "",
    lastOilChange: { type: "date" },
    lastTireChange: { type: "date" },
    lastBrakeChange: { type: "date" },
    lastBatteryChange: { type: "date" },
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  // Verificar autenticação e carregar veículo existente
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      // Verificar se usuário já tem veículo cadastrado
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (vehicles && vehicles.length > 0) {
        // Usuário já tem veículo, carregar e mostrar dashboard
        const dbVehicle = vehicles[0]
        const vehicle: Vehicle = {
          id: dbVehicle.id,
          type: dbVehicle.type,
          model: dbVehicle.model,
          year: dbVehicle.year,
          isZeroKm: dbVehicle.is_zero_km,
          currentKm: dbVehicle.current_km,
          usageType: dbVehicle.usage_type,
          averageKmPerMonth: dbVehicle.average_km_per_month,
          maintenanceHistory: [],
        }
        setVehicleData(vehicle)
        setShowDashboard(true)
      }

      setLoading(false)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Auto-avançar da etapa 11 para 12
  useEffect(() => {
    if (step === 11) {
      const timer = setTimeout(() => {
        setStep(12)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleNext = () => {
    if (step === 4 && data.isZeroKm === "Sim") {
      setStep(5)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 5 && data.isZeroKm === "Sim") {
      setStep(4)
    } else if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleVehicleTypeSelect = (type: string) => {
    setData({ ...data, vehicleType: type })
    setTimeout(() => setStep(2), 300)
  }

  const handleIsZeroKmSelect = (value: string) => {
    setData({ ...data, isZeroKm: value, currentKm: value === "Sim" ? "0" : "" })
    if (value === "Sim") {
      setTimeout(() => setStep(5), 300)
    } else {
      setTimeout(() => setStep(step + 0.5), 300)
    }
  }

  const handleUsageTypeSelect = (type: string) => {
    setData({ ...data, usageType: type })
    setTimeout(() => setStep(6), 300)
  }

  const handleStartMonitoring = async () => {
    if (!userId) return

    try {
      // Converte dados do quiz para formato do veículo
      const usageTypeMap: { [key: string]: "city" | "highway" | "mixed" } = {
        "Cidade": "city",
        "Estrada": "highway",
        "Ambos": "mixed",
      }

      const usageType = usageTypeMap[data.usageType] || "mixed"

      // Inserir veículo no banco de dados
      const { data: newVehicle, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: userId,
          type: data.vehicleType,
          model: data.vehicleModel,
          year: data.vehicleYear,
          is_zero_km: data.isZeroKm === "Sim",
          current_km: parseInt(data.currentKm) || 0,
          usage_type: usageType,
          average_km_per_month: calculateAverageKmPerMonth(usageType),
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao salvar veículo:', error)
        return
      }

      // Criar objeto Vehicle para o dashboard
      const vehicle: Vehicle = {
        id: newVehicle.id,
        type: data.vehicleType,
        model: data.vehicleModel,
        year: data.vehicleYear,
        isZeroKm: data.isZeroKm === "Sim",
        currentKm: parseInt(data.currentKm) || 0,
        usageType: usageType,
        averageKmPerMonth: calculateAverageKmPerMonth(usageType),
        maintenanceHistory: [],
      }

      // Salvar histórico de manutenção se fornecido
      const maintenanceInserts = []

      if (data.lastOilChange.type !== "not_done") {
        maintenanceInserts.push({
          vehicle_id: newVehicle.id,
          maintenance_type: 'oil',
          maintenance_name: 'Troca de óleo',
          performed_at_date: data.lastOilChange.date?.toISOString() || null,
          performed_at_km: data.lastOilChange.km ? parseInt(data.lastOilChange.km) : null,
        })
      }

      if (data.lastTireChange.type !== "not_done") {
        maintenanceInserts.push({
          vehicle_id: newVehicle.id,
          maintenance_type: 'tires',
          maintenance_name: 'Troca de pneus',
          performed_at_date: data.lastTireChange.date?.toISOString() || null,
          performed_at_km: data.lastTireChange.km ? parseInt(data.lastTireChange.km) : null,
        })
      }

      if (data.lastBrakeChange.type !== "not_done") {
        maintenanceInserts.push({
          vehicle_id: newVehicle.id,
          maintenance_type: 'brakes',
          maintenance_name: 'Troca de pastilhas de freio',
          performed_at_date: data.lastBrakeChange.date?.toISOString() || null,
          performed_at_km: data.lastBrakeChange.km ? parseInt(data.lastBrakeChange.km) : null,
        })
      }

      if (data.lastBatteryChange.type !== "not_done") {
        maintenanceInserts.push({
          vehicle_id: newVehicle.id,
          maintenance_type: 'battery',
          maintenance_name: 'Troca de bateria',
          performed_at_date: data.lastBatteryChange.date?.toISOString() || null,
          performed_at_km: data.lastBatteryChange.km ? parseInt(data.lastBatteryChange.km) : null,
        })
      }

      if (maintenanceInserts.length > 0) {
        await supabase.from('maintenance_history').insert(maintenanceInserts)
      }

      setVehicleData(vehicle)
      setShowDashboard(true)
    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error)
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "Carro":
        return <Car className="w-8 h-8" />
      case "Moto":
        return <Bike className="w-8 h-8" />
      default:
        return <Truck className="w-8 h-8" />
    }
  }

  const canContinueMaintenanceStep = (maintenanceData: MaintenanceData) => {
    if (maintenanceData.type === "not_done") return true
    if (maintenanceData.type === "date" && maintenanceData.date) return true
    if (maintenanceData.type === "km" && maintenanceData.km) return true
    return false
  }

  const renderMaintenanceStep = (
    stepNumber: number,
    title: string,
    maintenanceKey: keyof Pick<QuizData, "lastOilChange" | "lastTireChange" | "lastBrakeChange" | "lastBatteryChange">,
    progress: number
  ) => {
    const maintenanceData = data[maintenanceKey]

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Etapa {stepNumber} de 12</span>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>

          <div className="space-y-6">
            <RadioGroup
              value={maintenanceData.type}
              onValueChange={(value) => {
                setData({
                  ...data,
                  [maintenanceKey]: { type: value as "date" | "km" | "not_done" }
                })
              }}
            >
              <div className="flex items-center space-x-2 p-4 border-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value="date" id={`${maintenanceKey}-date`} />
                <Label htmlFor={`${maintenanceKey}-date`} className="flex-1 cursor-pointer text-lg">
                  Selecionar data
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value="km" id={`${maintenanceKey}-km`} />
                <Label htmlFor={`${maintenanceKey}-km`} className="flex-1 cursor-pointer text-lg">
                  Informar quilometragem
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                <RadioGroupItem value="not_done" id={`${maintenanceKey}-not-done`} />
                <Label htmlFor={`${maintenanceKey}-not-done`} className="flex-1 cursor-pointer text-lg">
                  Não foi realizada troca
                </Label>
              </div>
            </RadioGroup>

            {maintenanceData.type === "date" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Label className="text-base">Escolha a data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal p-6 text-lg rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {maintenanceData.date ? format(maintenanceData.date, "PPP", { locale: ptBR }) : "Escolha a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={maintenanceData.date}
                      onSelect={(date) => setData({
                        ...data,
                        [maintenanceKey]: { ...maintenanceData, date }
                      })}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {maintenanceData.type === "km" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Label htmlFor={`${maintenanceKey}-km-input`} className="text-base">Digite a quilometragem</Label>
                <Input
                  id={`${maintenanceKey}-km-input`}
                  type="number"
                  placeholder="Ex: 45000"
                  value={maintenanceData.km || ""}
                  onChange={(e) => setData({
                    ...data,
                    [maintenanceKey]: { ...maintenanceData, km: e.target.value }
                  })}
                  className="text-lg p-6 rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 py-6 text-lg rounded-xl"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canContinueMaintenanceStep(maintenanceData)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Se dashboard está ativo, mostra o dashboard
  if (showDashboard && vehicleData) {
    return <Dashboard vehicle={vehicleData} quizData={data} />
  }

  const renderStep = () => {
    // Etapa 0 - Tela de Abertura
    if (step === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 text-center shadow-2xl">
            {/* Botão de Logout */}
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                <Car className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Iremos monitorar a saúde do seu veículo!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Responda algumas perguntas e deixe o MecSentinel te ajudar!
            </p>
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Vamos começar!
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      )
    }

    // Etapa 1 - Tipo de Veículo
    if (step === 1) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 1 de 12</span>
                <span className="text-sm font-medium text-blue-600">8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "8%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual tipo do veículo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["Carro", "Moto", "Outro"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleVehicleTypeSelect(type)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 flex flex-col items-center gap-3 group hover:shadow-lg"
                >
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    {getVehicleIcon(type)}
                  </div>
                  <span className="text-lg font-semibold">{type}</span>
                </button>
              ))}
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full py-6 text-lg rounded-xl"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
          </Card>
        </div>
      )
    }

    // Etapa 2 - Modelo do Veículo
    if (step === 2) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 2 de 12</span>
                <span className="text-sm font-medium text-blue-600">17%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "17%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual modelo do veículo?</h2>
            <div className="space-y-4">
              <Label htmlFor="model" className="text-lg">Digite o modelo</Label>
              <Input
                id="model"
                placeholder="Ex: Honda Civic, Yamaha MT-07..."
                value={data.vehicleModel}
                onChange={(e) => setData({ ...data, vehicleModel: e.target.value })}
                className="text-lg p-6 rounded-xl"
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-6 text-lg rounded-xl"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!data.vehicleModel}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continuar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 3 - Ano do Veículo (Grid de botões)
    if (step === 3) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-4xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 3 de 12</span>
                <span className="text-sm font-medium text-blue-600">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "25%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual ano do veículo?</h2>
            <div className="max-h-[400px] overflow-y-auto mb-6 px-2">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setData({ ...data, vehicleYear: year.toString() })}
                    className={`p-4 border-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-md ${
                      data.vehicleYear === year.toString()
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6 text-lg rounded-xl"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!data.vehicleYear}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 4 - É 0KM?
    if (step === 4) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 4 de 12</span>
                <span className="text-sm font-medium text-blue-600">33%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "33%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">O veículo é 0KM?</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {["Sim", "Não"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleIsZeroKmSelect(option)}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 text-xl font-semibold hover:shadow-lg"
                >
                  {option}
                </button>
              ))}
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full py-6 text-lg rounded-xl"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
          </Card>
        </div>
      )
    }

    // Etapa 4.5 - Quilometragem (se não for 0KM)
    if (step === 4.5) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 4 de 12</span>
                <span className="text-sm font-medium text-blue-600">33%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "33%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Quantos quilômetros tem o veículo?</h2>
            <div className="space-y-4">
              <Label htmlFor="km" className="text-lg">Digite a quilometragem</Label>
              <Input
                id="km"
                type="number"
                placeholder="Ex: 45000"
                value={data.currentKm}
                onChange={(e) => setData({ ...data, currentKm: e.target.value })}
                className="text-lg p-6 rounded-xl"
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-6 text-lg rounded-xl"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  disabled={!data.currentKm}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continuar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 5 - Tipo de Uso
    if (step === 5) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 5 de 12</span>
                <span className="text-sm font-medium text-blue-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "42%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual tipo de uso do seu veículo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {["Cidade", "Estrada", "Ambos"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleUsageTypeSelect(type)}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 text-xl font-semibold hover:shadow-lg"
                >
                  {type}
                </button>
              ))}
            </div>
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full py-6 text-lg rounded-xl"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
          </Card>
        </div>
      )
    }

    // Etapa 6 - Última troca de óleo
    if (step === 6) {
      return renderMaintenanceStep(6, "Qual a data ou KM da última troca de óleo do motor?", "lastOilChange", 50)
    }

    // Etapa 7 - Última troca de pneus
    if (step === 7) {
      return renderMaintenanceStep(7, "Qual a data ou KM da última troca dos pneus?", "lastTireChange", 58)
    }

    // Etapa 8 - Última troca de pastilhas de freio
    if (step === 8) {
      return renderMaintenanceStep(8, "Qual a data ou KM da última troca das pastilhas de freio?", "lastBrakeChange", 67)
    }

    // Etapa 9 - Última troca de bateria
    if (step === 9) {
      return renderMaintenanceStep(9, "Quando foi a última troca da bateria?", "lastBatteryChange", 75)
    }

    // Etapa 10 - Recapitulando
    if (step === 10) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 10 de 12</span>
                <span className="text-sm font-medium text-blue-600">83%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "83%" }}></div>
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ótimo!</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Com base nas informações fornecidas, poderemos monitorar a saúde do seu veículo e notificar necessidade de manutenção.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6 text-lg rounded-xl"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 11 - Loading (auto-avança para etapa 12)
    if (step === 11) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 11 de 12</span>
                <span className="text-sm font-medium text-blue-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "92%" }}></div>
              </div>
            </div>
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Salvando informações!</h2>
              <p className="text-lg text-muted-foreground">Aguarde um momento...</p>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 12 - Finalização
    if (step === 12) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 12 de 12</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo pronto!</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Inicie o monitoramento e deixe o resto conosco.
              </p>
            </div>
            <Button
              onClick={handleStartMonitoring}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Iniciar monitoramento
              <CheckCircle2 className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      )
    }
  }

  return <>{renderStep()}</>
}
