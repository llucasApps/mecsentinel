// Integração com OpenAI API

export interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error("⚠️ NEXT_PUBLIC_OPENAI_API_KEY não está configurada no arquivo .env")
}

export async function callOpenAI(messages: OpenAIMessage[]): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API Key não configurada")
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação."
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente."
  }
}

// Gera regras de manutenção personalizadas com IA
export async function generateMaintenanceRules(vehicleData: {
  type: string
  model: string
  year: string
  currentKm: number
  usageType: string
}): Promise<{
  oil: { months: number; km: number }
  tires: { months: number; km: number }
  brakes: { months: number; km: number }
  battery: { months: number; km: number }
  explanation: string
}> {
  const prompt = `Você é um especialista em manutenção automotiva. Com base nos dados do veículo abaixo, sugira intervalos personalizados de manutenção:

Veículo: ${vehicleData.type} ${vehicleData.model} ${vehicleData.year}
Quilometragem atual: ${vehicleData.currentKm}km
Tipo de uso: ${vehicleData.usageType}

Forneça intervalos recomendados para:
1. Troca de óleo (em meses e km)
2. Troca de pneus (em meses e km)
3. Troca de pastilhas de freio (em meses e km)
4. Troca de bateria (em meses)

Responda APENAS no formato JSON:
{
  "oil": { "months": X, "km": Y },
  "tires": { "months": X, "km": Y },
  "brakes": { "months": X, "km": Y },
  "battery": { "months": X, "km": 0 },
  "explanation": "Breve explicação das recomendações"
}`

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: "Você é um especialista em manutenção automotiva que fornece recomendações precisas e personalizadas.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]

  const response = await callOpenAI(messages)
  
  try {
    // Tenta extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error("Error parsing AI response:", error)
  }

  // Retorna valores padrão se falhar
  return {
    oil: { months: 6, km: 10000 },
    tires: { months: 48, km: 60000 },
    brakes: { months: 24, km: 40000 },
    battery: { months: 36, km: 0 },
    explanation: "Usando intervalos padrão recomendados para seu tipo de veículo.",
  }
}

// Analisa saúde do veículo com IA
export async function analyzeVehicleHealth(vehicleData: {
  type: string
  model: string
  year: string
  currentKm: number
  usageType: string
  maintenanceItems: Array<{
    name: string
    status: string
    daysRemaining: number
    kmRemaining: number
  }>
}): Promise<{
  overallHealth: "excellent" | "good" | "attention" | "critical"
  summary: string
  recommendations: string[]
  attentionPoints: string[]
}> {
  const prompt = `Analise a saúde geral deste veículo e forneça recomendações:

Veículo: ${vehicleData.type} ${vehicleData.model} ${vehicleData.year}
Quilometragem: ${vehicleData.currentKm}km
Uso: ${vehicleData.usageType}

Status das manutenções:
${vehicleData.maintenanceItems.map(item => 
  `- ${item.name}: ${item.status} (${item.daysRemaining} dias ou ${item.kmRemaining}km restantes)`
).join('\n')}

Forneça uma análise completa no formato JSON:
{
  "overallHealth": "excellent|good|attention|critical",
  "summary": "Resumo geral da saúde do veículo",
  "recommendations": ["recomendação 1", "recomendação 2", ...],
  "attentionPoints": ["ponto de atenção 1", "ponto de atenção 2", ...]
}`

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: "Você é um mecânico especialista que analisa a saúde de veículos e fornece recomendações práticas.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]

  const response = await callOpenAI(messages)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error("Error parsing AI response:", error)
  }

  // Retorna análise padrão se falhar
  const criticalCount = vehicleData.maintenanceItems.filter(i => i.status === "critical").length
  const attentionCount = vehicleData.maintenanceItems.filter(i => i.status === "attention").length
  
  let overallHealth: "excellent" | "good" | "attention" | "critical" = "good"
  if (criticalCount > 0) overallHealth = "critical"
  else if (attentionCount > 1) overallHealth = "attention"
  else if (attentionCount === 0) overallHealth = "excellent"

  return {
    overallHealth,
    summary: "Seu veículo está em condições gerais adequadas. Continue acompanhando as manutenções preventivas.",
    recommendations: [
      "Mantenha as revisões em dia",
      "Verifique regularmente os níveis de fluidos",
      "Acompanhe a pressão dos pneus semanalmente",
    ],
    attentionPoints: vehicleData.maintenanceItems
      .filter(i => i.status !== "normal")
      .map(i => `${i.name} precisa de atenção em breve`),
  }
}

// Chat com mecânico IA
export async function chatWithMechanic(
  messages: OpenAIMessage[],
  vehicleContext: {
    type: string
    model: string
    year: string
    currentKm: number
  }
): Promise<string> {
  const systemMessage: OpenAIMessage = {
    role: "system",
    content: `Você é um mecânico experiente e prestativo chamado "Mecânico 24h". 
Você está ajudando o dono de um ${vehicleContext.type} ${vehicleContext.model} ${vehicleContext.year} com ${vehicleContext.currentKm}km.
Forneça respostas claras, práticas e amigáveis sobre manutenção automotiva.
Seja conciso mas completo. Use emojis quando apropriado para tornar a conversa mais amigável.`,
  }

  const fullMessages = [systemMessage, ...messages]
  return await callOpenAI(fullMessages)
}
