"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import HCaptcha from "@hcaptcha/react-hcaptcha"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [captchaToken, setCaptchaToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const captchaRef = useRef<HCaptcha>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!captchaToken) {
      setError("Por favor completa el captcha")
      setLoading(false)
      return
    }

    try {
      // Aquí podrías verificar hCaptcha en un endpoint si quieres seguridad adicional
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground">
            Accede a tu cuenta para dejar reseñas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <HCaptcha
              sitekey="e9089450-c8c4-4daa-8844-973667befb7e" // ✅ tu sitekey
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </Card>
    </main>
  )
}
