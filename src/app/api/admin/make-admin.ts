import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Obtener sesión (usa getServerSession para next-auth v4+ en app dir)
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email requerido" });
  }

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  user.role = "admin";
  await user.save();

  res.status(200).json({ message: `Usuario ${email} ahora es administrador` });
}
