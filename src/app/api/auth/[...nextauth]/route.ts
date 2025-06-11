import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "next-auth"

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
        // TODO: Replace with actual authentication logic
        if (credentials?.email === "kenadderboss4@gmail.com" && credentials?.password === "convento30.") {
          return {
            id: "1",
            name: "Admin User",
            email: "kenadderboss4@gmail.com",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            isAdmin: true
          }
        }
        return null
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
