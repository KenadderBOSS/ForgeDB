import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "next-auth"
import fs from 'fs/promises'
import path from 'path'
import { verifyPassword } from "@/lib/password"

interface StoredUser {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), 'data/users.json')

async function getUsers(): Promise<StoredUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captcha: { label: "Captcha", type: "text" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const users = await getUsers()
        const user = users.find(u => u.email === credentials.email)

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          image: `/api/avatar/${user.email}`,
          isAdmin: user.role === 'admin'
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).isAdmin = token.isAdmin
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
