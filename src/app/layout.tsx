import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import SessionProvider from "@/components/SessionProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ForgeDB",
  description: "Plataforma para reseñas detalladas de mods de Minecraft, incluyendo información sobre compatibilidad y problemas comunes",
  keywords: "minecraft, mods, reviews, forge, compatibility, gaming",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen">
            <Navigation />
            <main className="pt-4">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
