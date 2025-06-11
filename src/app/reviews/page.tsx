"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ReviewCard from "@/components/ReviewCard"
import LoadingState from "@/components/LoadingState"
import type { Review } from "@/types/review"

export default function ReviewsPage() {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchReviews() {
      if (session?.user) {
        try {
          const response = await fetch("/api/reviews")
          if (!response.ok) {
            throw new Error("Error al cargar las reseñas")
          }
          const data = await response.json()
          setReviews(data.reviews)
        } catch (err) {
          setError("No se pudieron cargar las reseñas")
          console.error("Error fetching reviews:", err)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session?.user) {
      fetchReviews()
    } else if (status !== "loading") {
      setLoading(false)
    }
  }, [session, status])

  // Show loading state while checking authentication or fetching reviews
  if (status === "loading" || loading) {
    return <LoadingState />
  }

  // If not logged in, show login prompt
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            Inicia sesión para ver tus reseñas
          </h2>
          <p className="text-muted-foreground mb-6">
            Necesitas iniciar sesión para ver y gestionar tus reseñas de mods.
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
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Reseñas</h1>
          <p className="text-muted-foreground">
            Gestiona tus reseñas de mods
          </p>
        </div>
        <Button asChild>
          <Link href="/mods">Explorar Mods</Link>
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mb-4 text-center">{error}</div>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              showModName={true}
            />
          ))
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No has publicado reseñas aún
            </h2>
            <p className="text-muted-foreground mb-4">
              Explora los mods disponibles y comparte tu experiencia
            </p>
            <Button asChild>
              <Link href="/mods">Ver Mods Disponibles</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
