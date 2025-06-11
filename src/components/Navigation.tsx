"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              ForgeDB
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/mods"
                className={`text-sm ${
                  pathname === "/mods" 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Mods
              </Link>
              {session?.user && (
                <Link 
                  href="/reviews"
                  className={`text-sm ${
                    pathname === "/reviews" 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Mis Reseñas
                </Link>
              )}
              {session?.user?.isAdmin && (
                <Link 
                  href="/admin"
                  className={`text-sm ${
                    pathname === "/admin" 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost">Mi Perfil</Button>
                </Link>
                <Button 
                  variant="destructive" 
                  onClick={() => signOut()}
                  className="font-medium"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => signIn()}>
                  Iniciar Sesión
                </Button>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
