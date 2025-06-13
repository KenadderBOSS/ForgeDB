'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function VerifyClient() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("No se proporcionó el correo electrónico.");
      return;
    }

    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, email }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/login');
    } else {
      setMessage(data.error || 'Código incorrecto');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Verificación de correo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              type="text"
              placeholder="Ingresa el código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-red-500 text-sm">{message}</p>}
          <Button type="submit" className="w-full">
            Verificar
          </Button>
        </form>
      </Card>
    </main>
  );
}
