"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { Review } from "@/types/review"

interface ReviewCardProps {
  review: Review
  showModName?: boolean
  onReactionChange?: (reviewId: string, type: 'like' | 'dislike') => Promise<void>
}

export default function ReviewCard({ review, showModName, onReactionChange }: ReviewCardProps) {
  const { data: session } = useSession()
  const [currentReactions, setCurrentReactions] = useState(review.reactions)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(
    session?.user?.id ? review.userReactions[session.user.id] || null : null
  )

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!session?.user?.id) return

    const newReaction = userReaction === type ? null : type
    const oldReaction = userReaction

    // Optimistically update UI
    setUserReaction(newReaction)
    setCurrentReactions(prev => {
      const updated = { ...prev }
      if (oldReaction) {
        updated[`${oldReaction}s`]--
      }
      if (newReaction) {
        updated[`${newReaction}s`]++
      }
      return updated
    })

    // Update server
    if (onReactionChange) {
      await onReactionChange(review.id, type)
    }
  }

  const getIssueTypeColor = (type: 'client' | 'server' | 'both') => {
    switch (type) {
      case "client":
        return "bg-yellow-500"
      case "server":
        return "bg-blue-500"
      case "both":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <Card className="p-6 space-y-4">
      {showModName && review.modName && (
        <div className="mb-4">
          <Link 
            href={`/mods/${review.modId}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {review.modName}
          </Link>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12 bg-muted">
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
              {review.user.name[0].toUpperCase()}
            </div>
          </Avatar>
          <div>
            <h3 className="font-medium">{review.user.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{review.user.reviewCount} reseñas</span>
              <span>•</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {review.user.badges.map((badge, index) => (
            <Badge key={index} variant="secondary">
              {badge}
            </Badge>
          ))}
          {review.verified && (
            <Badge variant="default" className="bg-green-500">
              Verificado
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 py-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Versiones</h4>
          <div className="space-y-1 text-sm">
            <p>Minecraft: {review.minecraftVersion}</p>
            <p>Forge: {review.forgeVersion}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Especificaciones</h4>
          <div className="space-y-1 text-sm">
            <p>SO: {review.systemSpecs.os}</p>
            <p>CPU: {review.systemSpecs.cpu}</p>
            <p>GPU: {review.systemSpecs.gpu}</p>
            <p>RAM: {review.systemSpecs.ram}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Badge className={getIssueTypeColor(review.issueType)}>
            {review.issueType === "client" ? "Client-side" :
             review.issueType === "server" ? "Server-side" : "Ambos"}
          </Badge>
        </div>

        {review.conflictingMods.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Mods en Conflicto:</h4>
            <div className="flex flex-wrap gap-2">
              {review.conflictingMods.map((mod, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className={`${mod.causesCrash ? 'border-red-500 text-red-500' : 'border-yellow-500 text-yellow-500'}`}
                >
                  {mod.name}
                  {mod.causesCrash && ' ⚠️'}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ = Causa crasheo
            </p>
          </div>
        )}

        <p className="text-sm mb-4">{review.description}</p>

        {review.screenshot && (
          <div className="mb-4">
            <Image
              src={review.screenshot}
              alt="Screenshot"
              width={600}
              height={400}
              className="rounded-md w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={userReaction === 'like' ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction('like')}
              className="flex items-center space-x-2"
            >
              <span>❤️</span>
              <span>{currentReactions?.likes ?? 0}</span>
            </Button>
            <Button
              variant={userReaction === 'dislike' ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction('dislike')}
              className="flex items-center space-x-2"
            >
              <span>-</span>
              <span>{currentReactions?.dislikes ?? 0}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
