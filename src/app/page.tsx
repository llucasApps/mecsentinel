"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Car, Bike, Truck, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type QuizData = {
  vehicleType: string
  vehicleModel: string
  vehicleYear: string
  isZeroKm: string
  currentKm: string
  usageType: string
  lastOilChange: Date | undefined
  lastTireChange: Date | undefined
  lastBrakeChange: Date | undefined
  lastBatteryChange: Date | undefined
}

export default function MecSentinelQuiz() {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<QuizData>({
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    isZeroKm: "",
    currentKm: "",
    usageType: "",
    lastOilChange: undefined,
    lastTireChange: undefined,
    lastBrakeChange: undefined,
    lastBatteryChange: undefined,
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  const handleNext = () => {
    if (step === 4 && data.isZeroKm === "Sim") {
      setStep(5)
    } else if (step === 11) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setStep(12)
      }, 2000)
    } else {
      setStep(step + 1)
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

  const renderStep = () => {
    // Etapa 0 - Tela de Abertura
    if (step === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 text-center shadow-2xl">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Button
                onClick={handleNext}
                disabled={!data.vehicleModel}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 3 - Ano do Veículo
    if (step === 3) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
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
            <div className="space-y-4">
              <Label htmlFor="year" className="text-lg">Selecione o ano</Label>
              <Select value={data.vehicleYear} onValueChange={(value) => setData({ ...data, vehicleYear: value })}>
                <SelectTrigger className="text-lg p-6 rounded-xl">
                  <SelectValue placeholder="Escolha o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleNext}
                disabled={!data.vehicleYear}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
            <div className="grid grid-cols-2 gap-4">
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
              <Button
                onClick={() => setStep(5)}
                disabled={!data.currentKm}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </Card>
        </div>
      )
    }

    // Etapa 6 - Última troca de óleo
    if (step === 6) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 6 de 12</span>
                <span className="text-sm font-medium text-blue-600">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "50%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual a data da última troca de óleo do motor?</h2>
            <div className="space-y-4">
              <Label className="text-lg">Selecione a data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal p-6 text-lg rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {data.lastOilChange ? format(data.lastOilChange, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.lastOilChange}
                    onSelect={(date) => setData({ ...data, lastOilChange: date })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleNext}
                disabled={!data.lastOilChange}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 7 - Última troca de pneus
    if (step === 7) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 7 de 12</span>
                <span className="text-sm font-medium text-blue-600">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "58%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual a data da última troca dos pneus?</h2>
            <div className="space-y-4">
              <Label className="text-lg">Selecione a data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal p-6 text-lg rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {data.lastTireChange ? format(data.lastTireChange, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.lastTireChange}
                    onSelect={(date) => setData({ ...data, lastTireChange: date })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleNext}
                disabled={!data.lastTireChange}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 8 - Última troca de pastilhas de freio
    if (step === 8) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 8 de 12</span>
                <span className="text-sm font-medium text-blue-600">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "67%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Qual a data da última troca das pastilhas de freio?</h2>
            <div className="space-y-4">
              <Label className="text-lg">Selecione a data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal p-6 text-lg rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {data.lastBrakeChange ? format(data.lastBrakeChange, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.lastBrakeChange}
                    onSelect={(date) => setData({ ...data, lastBrakeChange: date })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleNext}
                disabled={!data.lastBrakeChange}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    // Etapa 9 - Última troca de bateria
    if (step === 9) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Etapa 9 de 12</span>
                <span className="text-sm font-medium text-blue-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Quando foi a última troca da bateria?</h2>
            <div className="space-y-4">
              <Label className="text-lg">Selecione a data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal p-6 text-lg rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {data.lastBatteryChange ? format(data.lastBatteryChange, "PPP", { locale: ptBR }) : "Escolha a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.lastBatteryChange}
                    onSelect={(date) => setData({ ...data, lastBatteryChange: date })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleNext}
                disabled={!data.lastBatteryChange}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      )
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
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      )
    }

    // Etapa 11 - Loading
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
              onClick={() => alert("Monitoramento iniciado! 🚗")}
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
