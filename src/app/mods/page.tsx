"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import LoadingState from "@/components/LoadingState"
import type { Mod } from "@/types/mod"

export default function ModsPage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [mods, setMods] = useState<Mod[]>([])
  const [fetchError, setFetchError] = useState("")
  const [loadingMods, setLoadingMods] = useState(true)

  // Fetch mods from API on component mount
  useEffect(() => {
    let isMounted = true

    const fetchMods = async () => {
      try {
        const response = await fetch("/api/mods")
        if (!response.ok) {
          throw new Error("Error al obtener los mods.")
        }
        const data = await response.json()
        
        // Only update state if component is still mounted
        if (isMounted) {
          setMods(data.mods)
          setLoadingMods(false)
        }
      } catch (error: any) {
        if (isMounted) {
          setFetchError(error.message || "Error al cargar mods.")
          setLoadingMods(false)
        }
      }
    }

    fetchMods()

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false
    }
  }, [])

  const filteredMods = mods.filter(mod =>
    mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Only show loading state when checking session AND loading mods
  if (status === "loading" && loadingMods) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {fetchError && (
        <div className="text-center text-red-500 mb-4">{fetchError}</div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mods de Minecraft</h1>
          <p className="text-muted-foreground">
            Explora y revisa los mods más populares
          </p>
        </div>
        <div className="w-full md:w-96">
          <Input
            type="search"
            placeholder="Buscar mods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {loadingMods ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMods.map((mod) => (
              <Card key={mod.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={mod.bannerUrl}
                    alt={mod.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{mod.name}</h2>
                  <p className="text-muted-foreground mb-4">
                    {mod.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>{mod.reviewCount} reseñas</span>
                      <span className="mx-2">•</span>
                      <span>⭐ {mod.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session ? (
                        <Link href={`/mods/${mod.id}?review=true`}>
                          <Button variant="default" size="sm">
                            Escribir Reseña
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => signIn()}
                        >
                          Iniciar para Reseñar
                        </Button>
                      )}
                      <Link href={`/mods/${mod.id}`}>
                        <Button variant="outline">Ver Detalles</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredMods.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">
                No se encontraron mods
              </h2>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
