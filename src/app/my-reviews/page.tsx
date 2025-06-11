"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ReviewCard from "@/components/ReviewCard"
import Link from "next/link"

// Mock data - Replace with actual API call
import type { Review } from "@/types/review"

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    userId: "user123",
    user: {
      name: "MinecraftPro",
      avatar: "/vercel.svg",
      badges: ["Experto", "100+ Reseñas"],
      reviewCount: 120,
    },
    modName: "JEI (Just Enough Items)",
    modId: "1",
    minecraftVersion: "1.19.2",
    forgeVersion: "43.2.0",
    systemSpecs: {
      os: "Windows",
      cpu: "Intel i7-9700K",
      gpu: "NVIDIA RTX 3070",
      ram: "16GB",
    },
    issueType: "client" as const,
    conflictingMods: [
      { name: "OptiFine", causesCrash: false },
      { name: "Better FPS", causesCrash: false }
    ],
    description: "Excelente mod, pero tiene algunos problemas de rendimiento cuando se usa junto con OptiFine. La interfaz a veces se congela al buscar items.",
    screenshot: undefined,
    reactions: {
      likes: 45,
      dislikes: 0
    },
    userReactions: {},
    createdAt: "2024-01-15T10:30:00Z",
  },
  // Add more mock reviews as needed
]

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [loading, setLoading] = useState(false)

  const handleDeleteReview = async (reviewId: string) => {
    // TODO: Implement actual delete logic
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReviews(reviews.filter(review => review.id !== reviewId))
    } catch (error) {
      console.error("Error deleting review:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mis Reseñas</h1>
            <p className="text-muted-foreground">
              Gestiona tus reseñas de mods
            </p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Link 
                    href={`/mods/${review.modId}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {review.modName}
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </div>
                <ReviewCard review={review} />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No has publicado reseñas aún
            </h2>
            <p className="text-muted-foreground mb-4">
              Comparte tu experiencia con los mods que has probado
            </p>
            <Link href="/mods">
              <Button>Explorar Mods</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
