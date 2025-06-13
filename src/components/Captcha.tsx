"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CaptchaProps {
  onChange: (value: string) => void
  onNumbersChange: (num1: number, num2: number) => void
}

export default function Captcha({ onChange, onNumbersChange }: CaptchaProps) {
  const [num1, setNum1] = useState<number>(() => Math.floor(Math.random() * 50) + 1)
  const [num2, setNum2] = useState<number>(() => Math.floor(Math.random() * 50) + 1)
  const [userAnswer, setUserAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onNumbersChange(num1, num2)
  }, [num1, num2, onNumbersChange])

  const handleChange = (value: string) => {
    setUserAnswer(value)
    onChange(value)

    // Validación instantánea
    if (!/^\d+$/.test(value)) {
      setError("Solo se permiten números")
    } else {
      setError(null)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Verificación de seguridad</Label>
      <div className="flex items-center gap-2">
        <span className="text-lg select-none">{num1} + {num2} =</span>
        <Input
          type="text"
          value={userAnswer}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24"
          placeholder="Respuesta"
          required
          inputMode="numeric"
          pattern="\d*"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export const validateCaptcha = (answer: string, num1: number, num2: number): boolean => {
  const parsed = parseInt(answer)
  if (isNaN(parsed)) return false
  return parsed === (num1 + num2)
}
