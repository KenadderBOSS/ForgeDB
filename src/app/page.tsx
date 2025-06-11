"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">
          Minecraft Forge Mods Review Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Deja reseñas detalladas sobre mods de Minecraft, incluyendo información sobre problemas client-side y server-side. Ayuda a la comunidad a tomar mejores decisiones.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button variant="default">Iniciar Sesión</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Registrarse</Button>
          </Link>
          <a href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Give me a Ko-fi ☕</Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Reseñas Detalladas</h3>
          <p className="text-muted-foreground">
            Comparte tu experiencia con información específica sobre versiones de Minecraft y Forge, especificaciones del sistema y más.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Compatibilidad</h3>
          <p className="text-muted-foreground">
            Identifica problemas client-side y server-side, además de conflictos entre mods para ayudar a otros usuarios.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Sistema de Valoración</h3>
          <p className="text-muted-foreground">
            Dale "me gusta" a las reseñas más útiles y encuentra rápidamente la información más relevante.
          </p>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">¿Listo para contribuir?</h2>
        <p className="text-muted-foreground mb-6">
          Únete a nuestra comunidad y ayuda a otros jugadores de Minecraft.
        </p>
        <Link href="/register">
          <Button size="lg">Crear una cuenta</Button>
        </Link>
      </section>
    </main>
  )
}
