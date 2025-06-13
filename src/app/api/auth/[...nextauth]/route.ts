import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

// Conexión a MongoDB
async function connectToDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  return client.db("test");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          const db = await connectToDatabase();

          const user = await db.collection("users").findOne({ 
            email: { $regex: new RegExp(`^${credentials.email}$`, 'i') }
          });

          if (!user) {
            throw new Error("Usuario no encontrado");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Contraseña incorrecta");
          }

          // Retorna los datos necesarios, asegurando que id sea string
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email,
            image: user.avatar || user.image || null,
            isAdmin: user.isAdmin || false,
          };
        } catch (error) {
          console.error('Error durante la autenticación:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Al autenticar, agregar info de usuario al token JWT
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Asegurarse que session.user exista
      if (!session.user) {
        session.user = {} as any;
      }

      // Pasar datos desde el token a la sesión
      if (token) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
