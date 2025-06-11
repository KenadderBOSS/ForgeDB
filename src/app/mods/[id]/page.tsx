"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import LoadingState from "@/components/LoadingState"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReviewForm from "@/components/ReviewForm"
import ReviewCard from "@/components/ReviewCard"
import Image from "next/image"
import type { Mod } from "@/types/mod"
import type { Review } from "@/types/review"

interface ModData {
  mod: Mod;
  reviews: Review[];
  statistics: {
    issueStats: {
      client: number;
      server: number;
      both: number;
    };
    conflictingMods: Array<{
      name: string;
      count: number;
    }>;
  };
}

export default function ModPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [showReviewForm, setShowReviewForm] = useState(searchParams.get("review") === "true")
  const [modData, setModData] = useState<ModData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const { data: session, status } = useSession()
  const isLoggedIn = !!session

  useEffect(() => {
    const fetchModData = async () => {
      try {
        const response = await fetch(`/api/mods/${params.id}`)
        if (!response.ok) {
          throw new Error("Error al cargar el mod")
        }
        const data = await response.json()
        setModData(data)
      } catch (err) {
        setError("No se pudo cargar la información del mod")
        console.error("Error fetching mod:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchModData()
  }, [params.id])

  if (status === "loading" || loading) {
    return <LoadingState />
  }

  if (error || !modData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {error || "No se encontró el mod"}
          </h2>
          <p className="text-muted-foreground mb-4">
            Vuelve al listado de mods e intenta nuevamente.
          </p>
          <Button asChild>
            <Link href="/mods">Volver a Mods</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const handleReviewSubmit = async (reviewData: any) => {
    if (!session) {
      alert("Debes iniciar sesión para publicar una reseña")
      return
    }
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reviewData,
          modId: params.id,
          modName: modData.mod.name,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al publicar la reseña")
      }

      const data = await response.json()
      
      // Update the reviews list with the new review
      setModData(prev => prev ? {
        ...prev,
        reviews: [data.review, ...prev.reviews]
      } : null)
      
      setShowReviewForm(false)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Error al publicar la reseña. Por favor, intenta nuevamente.")
    }
  }

  const { mod, reviews, statistics } = modData

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <div className="relative h-64">
          <Image
            src={mod.bannerUrl}
            alt={mod.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{mod.name}</h1>
              <div className="flex items-center text-muted-foreground">
                <span>{mod.reviewCount} reseñas</span>
                <span className="mx-2">•</span>
                <span>⭐ {mod.averageRating.toFixed(1)}</span>
              </div>
            </div>
            {isLoggedIn && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)}>
                Escribir Reseña
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">{mod.description}</p>
        </div>
      </Card>

      {showReviewForm && (
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nueva Reseña</h2>
              <Button
                variant="ghost"
                onClick={() => setShowReviewForm(false)}
              >
                Cancelar
              </Button>
            </div>
            <ReviewForm
              modId={params.id as string}
              onSubmit={handleReviewSubmit}
            />
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="recent">Más Recientes</TabsTrigger>
          <TabsTrigger value="popular">Más Valoradas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Client-side Issues</span>
                  <span>{statistics.issueStats.client}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Server-side Issues</span>
                  <span>{statistics.issueStats.server}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ambos</span>
                  <span>{statistics.issueStats.both}%</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Mods en Conflicto Comunes</h3>
              <ul className="space-y-2">
                {statistics.conflictingMods.map((mod) => (
                  <li key={mod.name} className="flex justify-between">
                    <span>{mod.name}</span>
                    <span>{mod.count} reportes</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="space-y-6">
            {[...reviews]
              .sort((a, b) => b.likes - a.likes)
              .map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {!isLoggedIn && (
        <Card className="p-6 text-center mt-8 border-primary/20">
          <h3 className="text-lg font-semibold mb-2">
            ¿Quieres compartir tu experiencia con este mod?
          </h3>
          <p className="text-muted-foreground mb-4">
            Inicia sesión para dejar tu reseña y ayudar a otros jugadores de Minecraft.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="default">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
