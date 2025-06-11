import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const USERS_FILE = path.join(process.cwd(), 'data/users.json');

interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
  // Ensure the data directory exists
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(request: NextRequest) {
  try {
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

    // Get existing users
    const users = await getUsers();

    // Check if email already exists
    if (users.some(user => user.email === email)) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    await saveUsers(users);

    // Return success without sensitive data
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
