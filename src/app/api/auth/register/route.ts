import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationCode } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, hcaptchaToken } = await request.json();

    if (!email || !password || !hcaptchaToken) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Validación de contraseña segura
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.])[A-Za-z\d@$!%*?&\-_.]{12,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
        },
        { status: 400 }
      );
    }

    const hcaptchaRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${hcaptchaToken}&secret=${process.env.HCAPTCHA_SECRET}`,
    });

    const hcaptchaData = await hcaptchaRes.json();

    if (!hcaptchaData.success) {
      return NextResponse.json({ error: "hCaptcha inválido" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await user.save();

    await sendVerificationCode(email, verificationCode);

    return NextResponse.json({ email }, { status: 200 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
