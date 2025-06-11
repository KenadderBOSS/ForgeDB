import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password, captchaAnswer, expectedAnswer } = await request.json();

    // Validate input
    if (!email || !password || !captchaAnswer) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validate captcha
    const parsedAnswer = parseInt(captchaAnswer, 10);
    if (isNaN(parsedAnswer) || parsedAnswer !== expectedAnswer) {
      return NextResponse.json(
        { error: 'Captcha incorrecto' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'user',
    });

    await newUser.save();

    // Remove password field and return user data
    const userWithoutPassword = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
