import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationCode } from "@/lib/sendEmail";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, captchaAnswer, expectedAnswer } = await request.json();

    if (!email || !password || !captchaAnswer) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const parsedAnswer = parseInt(captchaAnswer, 10);
    if (isNaN(parsedAnswer) || parsedAnswer !== expectedAnswer) {
      return NextResponse.json({ error: "Captcha incorrecto" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = generateCode();

    const newUser = new User({
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      verificationCode,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 minutos en ms
    });

    await newUser.save();

    await sendVerificationCode(email, verificationCode);

    return NextResponse.json(
      { message: "Usuario registrado. Revisa tu correo para el código de verificación." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 });
  }
}
