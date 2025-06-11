import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyPassword } from "@/lib/password";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tucorreo@ejemplo.com" },
        password: { label: "Contraseña", type: "password" }
        // captcha si usas, implementa validación separada
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        await dbConnect();

        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Credenciales inválidas"); // no especificar si es usuario o contraseña
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Credenciales inválidas");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.email.split("@")[0],
          isAdmin: user.role === "admin"
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
