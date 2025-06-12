"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface VerifyPageProps {
  searchParams?: {
    email?: string;
  };
}

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const email = searchParams?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código incorrecto");
      }

      // Código correcto, redirige a login o página principal
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error verificando código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Verificación de cuenta</h1>
          <p className="text-muted-foreground">
            Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              pattern="\d{6}"
              title="Ingresa un código de 6 dígitos"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
