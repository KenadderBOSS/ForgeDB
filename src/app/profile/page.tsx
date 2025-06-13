"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import LoadingState from "@/components/LoadingState";

interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Cargar perfil del usuario al montar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleUpdateAvatar = async () => {
    if (!avatarUrl.trim()) {
      setError("La URL del avatar es requerida");
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el avatar");
      }

      // Actualizar el estado local inmediatamente
      setUserProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      
      // Reset image states
      setImageLoading(false);
      setImageError(false);
      
      // Actualizar la sesión de NextAuth
      await update({
        ...session,
        user: {
          ...session?.user,
          image: avatarUrl
        }
      });

      setSuccess("Avatar actualizado exitosamente");
      setAvatarUrl("");
    } catch (err: any) {
      setError(err.message || "Error al actualizar el avatar");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading") {
    return <LoadingState />;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Acceso Denegado</h2>
          <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</p>
        </Card>
      </div>
    );
  }

  // Usar el avatar del perfil si existe, sino el de la sesión
  const currentAvatar = userProfile?.avatar || session.user?.image;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-24 h-24 relative">
              {currentAvatar && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  <Image
                    src={currentAvatar}
                    alt={session.user?.name || "Avatar"}
                    width={96}
                    height={96}
                    className={`rounded-full object-cover transition-opacity duration-200 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    priority
                    unoptimized={currentAvatar.includes('gelbooru.com')}
                    onLoadStart={() => setImageLoading(true)}
                    onLoad={() => {
                      setImageLoading(false);
                      setImageError(false);
                    }}
                    onError={(e) => {
                      setImageLoading(false);
                      setImageError(true);
                      console.error('Error loading image:', currentAvatar);
                    }}
                  />
                </>
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/png?seed=${session.user?.email}`}
                  alt={session.user?.name || "Avatar"}
                  width={96}
                  height={96}
                  style={{ borderRadius: "50%" }}
                />
              )}
            </Avatar>

            <div>
              <h2 className="text-xl font-semibold">{session.user?.name}</h2>
              <p className="text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="avatarUrl">URL del Avatar</Label>
              <div className="flex gap-2">
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <Button onClick={handleUpdateAvatar} disabled={isUpdating}>
                  {isUpdating ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Dominios permitidos: images.pexels.com, api.dicebear.com, files.yande.re, konachan.com, img4.gelbooru.com
              </p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Reseñas</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Me gusta recibidos</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Reseñas verificadas</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}