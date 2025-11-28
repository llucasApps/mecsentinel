"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Car, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError("Email ou senha incorretos. Verifique suas credenciais.")
        setLoading(false)
        return
      }

      if (data.user) {
        // Verificar se o perfil existe
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (!profile) {
          // Criar perfil se não existir
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email!,
          })
        }

        // Sincronizar sessão com o servidor para o middleware reconhecer
        if (data.session) {
          await fetch('/auth/set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_IN', session: data.session })
          })
        }

        // Redirecionar para a página principal (quiz)
        router.push("/")
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8 md:p-10 shadow-2xl">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <Car className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MecSentinel
          </h1>
          <p className="text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Campo de Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 py-6 text-base rounded-xl"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 py-6 text-base rounded-xl"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Botão de Login */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        {/* Informação Adicional */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-center text-muted-foreground">
            Suas credenciais foram enviadas para seu email após a assinatura do
            aplicativo.
          </p>
        </div>
      </Card>
    </div>
  )
}
