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

// PUT endpoint to handle reactions (likes/dislikes)
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
    if (!['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de reacción inválido' },
        { status: 400 }
      );
    }

    const reviews = await readReviewsFile();
    const reviewIndex = reviews.findIndex((r: any) => r.id === params.id);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      );
    }

    const review = reviews[reviewIndex];
    const userId = session.user.id;
    const currentReaction = review.userReactions[userId];

    // Remove previous reaction if exists
    if (currentReaction) {
      review.reactions[`${currentReaction}s`]--;
    }

    // Add new reaction if different from current
    if (!currentReaction || currentReaction !== type) {
      review.reactions[`${type}s`]++;
      review.userReactions[userId] = type;
    } else {
      // If same reaction, remove it
      delete review.userReactions[userId];
    }

    await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2));

    return NextResponse.json({
      message: 'Reacción actualizada',
      review
    });
  } catch (error) {
    console.error('Error updating review reaction:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la reacción' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to handle review deletion (for admins)
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
