"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface ReviewFormProps {
  modId: string
  onSubmit: (data: any) => void
}

interface ConflictingMod {
  name: string;
  causesCrash: boolean;
}

interface FormData {
  minecraftVersion: string;
  forgeVersion: string;
  systemSpecs: {
    os: string;
    cpu: string;
    gpu: string;
    ram: string;
  };
  issueType: 'client' | 'server' | 'both' | '';
  conflictingMods: ConflictingMod[];
  tempModName: string;
  description: string;
}

export default function ReviewForm({ modId, onSubmit }: ReviewFormProps) {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>({
    minecraftVersion: "",
    forgeVersion: "",
    systemSpecs: {
      os: "",
      cpu: "",
      gpu: "",
      ram: "",
    },
    issueType: "",
    conflictingMods: [],
    tempModName: "",
    description: "",
  })

  const handleAddConflictingMod = () => {
    if (!formData.tempModName.trim()) return;

    setFormData(prev => ({
      ...prev,
      conflictingMods: [
        ...prev.conflictingMods,
        { name: formData.tempModName.trim(), causesCrash: false }
      ],
      tempModName: ""
    }));
  };

  const handleRemoveConflictingMod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conflictingMods: prev.conflictingMods.filter((_, i) => i !== index)
    }));
  };

  const toggleCrash = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conflictingMods: prev.conflictingMods.map((mod, i) => 
        i === index ? { ...mod, causesCrash: !mod.causesCrash } : mod
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      const confirmed = window.confirm(
        "Necesitas iniciar sesión para publicar una reseña. ¿Deseas iniciar sesión ahora?"
      )
      if (confirmed) {
        signIn()
      }
      return
    }

    const reviewData = {
      ...formData,
      modId,
      reactions: {
        likes: 0,
        dislikes: 0
      },
      userReactions: {},
      verified: false
    }

    onSubmit(reviewData)
  }

  if (status === "loading") {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minecraftVersion">Versión de Minecraft</Label>
            <Input
              id="minecraftVersion"
              required
              value={formData.minecraftVersion}
              onChange={(e) => setFormData({ ...formData, minecraftVersion: e.target.value })}
              placeholder="ej. 1.19.2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forgeVersion">Versión de Forge</Label>
            <Input
              id="forgeVersion"
              required
              value={formData.forgeVersion}
              onChange={(e) => setFormData({ ...formData, forgeVersion: e.target.value })}
              placeholder="ej. 43.2.0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Especificaciones del Sistema</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="os">Sistema Operativo</Label>
              <Select
                value={formData.systemSpecs.os}
                onValueChange={(value) => setFormData({
                  ...formData,
                  systemSpecs: { ...formData.systemSpecs, os: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona SO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Windows">Windows</SelectItem>
                  <SelectItem value="MacOS">MacOS</SelectItem>
                  <SelectItem value="Linux">Linux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram">RAM</Label>
              <Input
                id="ram"
                required
                value={formData.systemSpecs.ram}
                onChange={(e) => setFormData({
                  ...formData,
                  systemSpecs: { ...formData.systemSpecs, ram: e.target.value }
                })}
                placeholder="ej. 8GB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpu">CPU</Label>
              <Input
                id="cpu"
                required
                value={formData.systemSpecs.cpu}
                onChange={(e) => setFormData({
                  ...formData,
                  systemSpecs: { ...formData.systemSpecs, cpu: e.target.value }
                })}
                placeholder="ej. Intel i5-9600K"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu">GPU</Label>
              <Input
                id="gpu"
                required
                value={formData.systemSpecs.gpu}
                onChange={(e) => setFormData({
                  ...formData,
                  systemSpecs: { ...formData.systemSpecs, gpu: e.target.value }
                })}
                placeholder="ej. NVIDIA GTX 1660"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Tipo de Problema</Label>
          <RadioGroup
            value={formData.issueType}
            onValueChange={(value: 'client' | 'server' | 'both') => 
              setFormData({ ...formData, issueType: value })
            }
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="client" />
              <Label htmlFor="client">Client-side</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="server" id="server" />
              <Label htmlFor="server">Server-side</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both">Ambos</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>Mods en Conflicto</Label>
          <div className="flex gap-2">
            <Input
              value={formData.tempModName}
              onChange={(e) => setFormData({ ...formData, tempModName: e.target.value })}
              placeholder="Nombre del mod"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddConflictingMod();
                }
              }}
            />
            <Button type="button" onClick={handleAddConflictingMod}>
              Agregar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.conflictingMods.map((mod, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                <span>{mod.name}</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`crash-${index}`}
                    checked={mod.causesCrash}
                    onCheckedChange={() => toggleCrash(index)}
                  />
                  <Label htmlFor={`crash-${index}`} className="text-sm">
                    Causa Crasheo
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveConflictingMod(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Nota: La veracidad de las incompatibilidades será verificada por la comunidad.
            Las reseñas con información incorrecta podrán ser eliminadas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción Detallada</Label>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe tu experiencia con el mod, problemas encontrados, y posibles soluciones..."
            rows={5}
          />
        </div>

        <Button type="submit" className="w-full">
          Publicar Reseña
        </Button>
      </form>
    </Card>
  )
}
