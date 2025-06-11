import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { promises as fs } from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function readUsersFile() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with an empty array
    await fs.writeFile(usersFilePath, '[]');
    return [];
  }
}

async function writeUsersFile(users: any[]) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const users = await readUsersFile();
    const user = users.find((u: any) => u.email === session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Error al obtener el perfil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { avatar } = body;

    if (!avatar) {
      return NextResponse.json(
        { error: 'La URL del avatar es requerida' },
        { status: 400 }
      );
    }

    // Validate image URL
    try {
      const urlObj = new URL(avatar);
      const allowedDomains = [
        'images.pexels.com',
        'api.dicebear.com',
        'files.yande.re',
        'konachan.com'
      ];
      if (!allowedDomains.some(domain => urlObj.hostname === domain)) {
        return NextResponse.json({ 
          error: 'La URL del avatar debe ser de uno de los dominios permitidos' 
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ 
        error: 'URL de imagen inválida' 
      }, { status: 400 });
    }

    const users = await readUsersFile();
    const userIndex = users.findIndex((u: any) => u.email === session.user.email);

    if (userIndex === -1) {
      // Create new user profile
      users.push({
        email: session.user.email,
        name: session.user.name,
        avatar,
      });
    } else {
      // Update existing user profile
      users[userIndex].avatar = avatar;
    }

    await writeUsersFile(users);

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      avatar
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    );
  }
}
