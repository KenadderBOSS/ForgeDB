"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaRef = useRef<HCaptcha>(null);

  const isPasswordValid = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.])[A-Za-z\d@$!%*?&\-_.]{12,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(password)) {
      setError(
        "La contraseña debe tener al menos 12 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial."
      );
      return;
    }

    if (!captchaToken) {
      setError("Por favor completa el captcha");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          hcaptchaToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error en el registro");

      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Registro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
            </p>
          </div>

          <div>
            <HCaptcha
              sitekey="e9089450-c8c4-4daa-8844-973667befb7e"
              onVerify={(token) => setCaptchaToken(token)}
              ref={captchaRef}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
