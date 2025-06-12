import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Usuario ya verificado' }, { status: 200 });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return NextResponse.json({ message: 'Cuenta verificada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
