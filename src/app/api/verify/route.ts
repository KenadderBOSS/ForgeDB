import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  await dbConnect();
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email y código son requeridos" }, { status: 400 });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (user.isVerified) {
    return NextResponse.json({ error: "El usuario ya está verificado" }, { status: 400 });
  }

  const now = Date.now();
  if (
    user.verificationCode !== code ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < now
  ) {
    return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Cuenta verificada con éxito" }, { status: 200 });
}
