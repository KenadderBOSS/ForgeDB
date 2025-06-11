import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');
const modsFilePath = path.join(process.cwd(), 'data', 'mods.json');

async function readReviewsFile() {
  try {
    const data = await fs.readFile(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with an empty array
    await fs.writeFile(reviewsFilePath, '[]');
    return [];
  }
}

async function readModsFile() {
  try {
    const data = await fs.readFile(modsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function updateModStats(modId: string) {
  const reviews = await readReviewsFile();
  const mods = await readModsFile();

  const modReviews = reviews.filter((review: any) => review.modId === modId);
  const mod = mods.find((mod: any) => mod.id === modId);

  if (mod) {
    mod.reviewCount = modReviews.length;
    // For now, we'll use a simple 5-star rating for all reviews
    mod.averageRating = modReviews.length > 0 ? 5 : 0;

    await fs.writeFile(modsFilePath, JSON.stringify(mods, null, 2));
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const reviews = await readReviewsFile();
    const userReviews = reviews.filter((review: any) => review.userId === session.user.id);

    return NextResponse.json({ reviews: userReviews });
  } catch (error: any) {
    console.error('Error reading reviews:', error);
    return NextResponse.json(
      { error: 'Error al leer las reseñas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      modId,
      modName,
      minecraftVersion,
      forgeVersion,
      systemSpecs,
      issueType,
      conflictingMods,
      description
    } = body;

    // Validate required fields
    if (!modId || !modName || !description || !issueType) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const newReview = {
      id: Date.now().toString(),
      modId,
      modName,
      userId: session.user.id,
      user: {
        name: session.user.name,
        avatar: session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
        badges: [],
        reviewCount: 1,
      },
      minecraftVersion,
      forgeVersion,
      systemSpecs,
      issueType,
      conflictingMods,
      description,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const reviews = await readReviewsFile();
    reviews.push(newReview);
    await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2));

    // Update mod stats (review count and average rating)
    await updateModStats(modId);

    return NextResponse.json({
      message: 'Reseña agregada exitosamente',
      review: newReview,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Error al crear la reseña' },
      { status: 500 }
    );
  }
}
