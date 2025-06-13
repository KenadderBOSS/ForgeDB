"use client"

import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import type { Review } from "@/types/review"

// IMPORTA TU USERS.JSON DIRECTAMENTE AQUÍ
// Ajusta la ruta según donde tengas tu users.json
// import usersData from '@/data/users.json'
// O si está en public:
// const usersData = [
//   {
//     "email": "kenadderboss4@gmail.com",
//     "name": "kenadderboss4",
//     "image": "https://img4.gelbooru.com//samples/f4/09/sample_f409ba8933e08a6e90f2c62696dd1b86.jpg"
//   },
//   {
//     "email": "kenadderboss3@proton.me",
//     "name": "kenadderboss3@proton.me",
//     "image": "https://konachan.com/sample/ce47234498faabca48fe63f5b834548c/Konachan.com%20-%20375162%20sample.jpg"
//   }
// ]

// TEMPORALMENTE voy a usar los datos que me diste:
const usersData = [
  {
    "email": "kenadderboss4@gmail.com",
    "name": "kenadderboss4",
    "image": "https://img4.gelbooru.com//samples/f4/09/sample_f409ba8933e08a6e90f2c62696dd1b86.jpg"
  },
  {
    "email": "kenadderboss3@proton.me",
    "name": "kenadderboss3@proton.me",
    "image": "https://konachan.com/sample/ce47234498faabca48fe63f5b834548c/Konachan.com%20-%20375162%20sample.jpg"
  }
]

interface ReviewCardProps {
  review: Review
  showModName?: boolean
}

export default function ReviewCard({ review, showModName }: ReviewCardProps) {
  const { data: session } = useSession()

  if (!review || !review.user) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Esta reseña fue enviada por un usuario que ya no existe.
        </p>
      </Card>
    )
  }

  // Función para verificar si un string es un email
  const isEmail = (str: string) => {
    if (!str) return false
    return str.includes('@') && str.includes('.')
  }

  // Función para encontrar el usuario
  const findUser = () => {
    console.log('🔍 Buscando usuario para:', {
      userId: review.userId,
      userName: review.user.name,
      isUserNameEmail: isEmail(review.user.name)
    })

    // Si review.user.name es un email, buscar por email
    if (isEmail(review.user.name)) {
      const user = usersData.find(u => u.email === review.user.name)
      console.log('📧 Buscando por email (user.name):', review.user.name, '→', user)
      if (user) return user
    }

    // Si review.userId es un email, buscar por email
    if (review.userId && isEmail(review.userId)) {
      const user = usersData.find(u => u.email === review.userId)
      console.log('📧 Buscando por email (userId):', review.userId, '→', user)
      if (user) return user
    }

    // Buscar por nombre exacto
    const userByName = usersData.find(u => u.name === review.user.name)
    console.log('👤 Buscando por nombre:', review.user.name, '→', userByName)
    if (userByName) return userByName

    // Si no se encontró, buscar por userId como nombre
    if (review.userId) {
      const userByUserId = usersData.find(u => u.name === review.userId)
      console.log('🆔 Buscando por userId como nombre:', review.userId, '→', userByUserId)
      if (userByUserId) return userByUserId
    }

    console.log('❌ Usuario no encontrado')
    return null
  }

  const userData = findUser()
  const userImage = userData?.image || null

  console.log('🖼️ Imagen final a mostrar:', userImage)

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
      {/* Debug info - REMOVER EN PRODUCCIÓN */}
      <div className="bg-gray-100 p-2 rounded text-xs">
        <strong>DEBUG INFO:</strong><br/>
        ReviewId: {review.id}<br/>
        UserId: {review.userId || 'VACÍO'}<br/>
        UserName: {review.user.name}<br/>
        UserName es email: {isEmail(review.user.name) ? 'Sí' : 'No'}<br/>
        Found User: {userData ? `${userData.name} (${userData.email})` : 'No encontrado'}<br/>
        Image URL: {userImage || 'No image'}<br/>
        Todos los usuarios: {JSON.stringify(usersData.map(u => u.email))}
      </div>

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
          <Avatar className="w-12 h-12 bg-muted overflow-hidden">
            {userImage ? (
              <img
                src={userImage}
                alt={review.user.name}
                className="rounded-full object-cover w-full h-full"
                onError={(e) => {
                  console.error('❌ Error cargando imagen:', userImage)
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('✅ Imagen cargada correctamente:', userImage)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                {review.user.name[0].toUpperCase()}
              </div>
            )}
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
      </div>
    </Card>
  )
}