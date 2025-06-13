import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

async function readReviewsFile() {
  try {
    const data = await fs.readFile(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function readUsersFile() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// NUEVO: GET endpoint para obtener reviews con datos de usuario
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await readReviewsFile();
    const users = await readUsersFile();
    
    // Encontrar la review específica
    const review = reviews.find((r: any) => r.id === params.id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Combinar datos de review con datos de usuario
    const user = users.find((u: any) => u.id === review.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado para esta reseña' },
        { status: 404 }
      );
    }

    const reviewWithUser = {
      ...review,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        reviewCount: user.reviewCount || 0,
        badges: user.badges || []
      }
    };

    return NextResponse.json(reviewWithUser);
  } catch (error) {
    console.error('Error en GET review:', error);
    return NextResponse.json(
      { error: 'Error al obtener la reseña' },
      { status: 500 }
    );
  }
}

// PUT endpoint simplified, no reactions handling
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { type } = await request.json();
    // Validar tipo pero sin hacer nada con él
    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de reacción inválido' },
        { status: 400 }
      );
    }

    const reviews = await readReviewsFile();
    const users = await readUsersFile();
    const reviewIndex = reviews.findIndex((r: any) => r.id === params.id);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    // Combinar con datos de usuario para la respuesta
    const review = reviews[reviewIndex];
    const user = users.find((u: any) => u.id === review.userId);
    
    const reviewWithUser = {
      ...review,
      user: user ? {
        id: user.id,
        name: user.name,
        image: user.image,
        reviewCount: user.reviewCount || 0,
        badges: user.badges || []
      } : null
    };

    return NextResponse.json({
      message: 'Reacción recibida pero no almacenada',
      review: reviewWithUser
    });
  } catch (error) {
    console.error('Error en PUT review:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE endpoint sin cambios
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const reviews = await readReviewsFile();
    const reviewIndex = reviews.findIndex((r: any) => r.id === params.id);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    reviews.splice(reviewIndex, 1);
    await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2));

    return NextResponse.json({
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la reseña' },
      { status: 500 }
    );
  }
}