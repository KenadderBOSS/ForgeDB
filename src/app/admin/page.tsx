"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [modData, setModData] = useState({
    name: "",
    description: "",
    bannerUrl: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  if (!session?.user?.isAdmin) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600 text-lg font-semibold">
          Acceso denegado. No tienes permisos para ver esta página.
        </p>
      </main>
    )
  }

  const validateImageUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const allowedDomains = [
        'images.pexels.com',
        'api.dicebear.com',
        'files.yande.re',
        'konachan.com'
      ];
      return allowedDomains.some(domain => urlObj.hostname === domain);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateImageUrl(modData.bannerUrl)) {
      setError("La URL de la imagen debe ser de uno de los dominios permitidos: images.pexels.com, api.dicebear.com, files.yande.re, konachan.com");
      return;
    }
    
    try {
      const response = await fetch("/api/mods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || "Ocurrió un error. Intenta nuevamente.")
      } else {
        setSuccess(`${result.message}. Archivo modificado: ${result.fileModified}`)
        setModData({ name: "", description: "", bannerUrl: "" })
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
        <p className="text-muted-foreground mb-6">Agrega nuevos mods al sitio</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="mod-name">Nombre del Mod</Label>
            <Input
              id="mod-name"
              type="text"
              placeholder="Nombre del mod"
              value={modData.name}
              onChange={(e) => setModData({ ...modData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mod-description">Descripción</Label>
            <Input
              id="mod-description"
              type="text"
              placeholder="Descripción detallada del mod"
              value={modData.description}
              onChange={(e) => setModData({ ...modData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mod-banner">Imagen de Banner</Label>
            <Input
              id="mod-banner"
              type="url"
              placeholder="https://images.pexels.com/photo-...jpg"
              value={modData.bannerUrl}
              onChange={(e) => setModData({ ...modData, bannerUrl: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">Agregar Mod</Button>
        </form>
      </Card>
    </main>
  )
}
