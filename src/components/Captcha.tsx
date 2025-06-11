"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CaptchaProps {
  onChange: (value: string) => void
  onNumbersChange: (num1: number, num2: number) => void
}

export default function Captcha({ onChange, onNumbersChange }: CaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")

  const generateNumbers = () => {
    const newNum1 = Math.floor(Math.random() * 10);
    const newNum2 = Math.floor(Math.random() * 10);
    setNum1(newNum1);
    setNum2(newNum2);
    onNumbersChange(newNum1, newNum2);
  }

  useEffect(() => {
    generateNumbers()
  }, [onNumbersChange])

  const handleChange = (value: string) => {
    setUserAnswer(value)
    onChange(value)
  }

  return (
    <div className="space-y-2">
      <Label>Verificación de Seguridad</Label>
      <div className="flex items-center gap-2">
        <span className="text-lg">{num1} + {num2} = </span>
        <Input
          type="number"
          value={userAnswer}
          onChange={(e) => handleChange(e.target.value)}
          className="w-20"
          placeholder="?"
          required
        />
      </div>
    </div>
  )
}

export const validateCaptcha = (answer: string, num1: number, num2: number): boolean => {
  return parseInt(answer) === (num1 + num2);
};
