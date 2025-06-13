import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const modsFilePath = path.join(process.cwd(), 'data', 'mods.json');
const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');

async function readModsFile() {
  try {
    const data = await fs.readFile(modsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[readModsFile] Error leyendo mods.json:', error);
    throw new Error('No se pudo leer el archivo de mods');
  }
}

async function readReviewsFile() {
  try {
    const data = await fs.readFile(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[readReviewsFile] Error leyendo reviews.json:', error);
    throw new Error('No se pudo leer el archivo de reviews');
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mods = await readModsFile();
    const reviews = await readReviewsFile();

    if (!Array.isArray(mods)) {
      console.error('[GET] mods.json no es un array');
      return NextResponse.json(
        { error: 'Archivo de mods corrupto o inválido' },
        { status: 500 }
      );
    }
    if (!Array.isArray(reviews)) {
      console.error('[GET] reviews.json no es un array');
      return NextResponse.json(
        { error: 'Archivo de reviews corrupto o inválido' },
        { status: 500 }
      );
    }

    const mod = mods.find((m: any) => m.id === params.id);
    if (!mod) {
      console.warn(`[GET] Mod con id ${params.id} no encontrado`);
      return NextResponse.json(
        { error: 'Mod no encontrado' },
        { status: 404 }
      );
    }

    // Get reviews for this mod
    const modReviews = reviews.filter((r: any) => r.modId === params.id);

    // Calculate statistics
    const issueTypes = modReviews.reduce((acc: any, review: any) => {
      if (review && typeof review.issueType === 'string') {
        acc[review.issueType] = (acc[review.issueType] || 0) + 1;
      }
      return acc;
    }, {});

    const totalReviews = modReviews.length;
    const issueStats = {
      client: totalReviews ? Math.round((issueTypes.client || 0) / totalReviews * 100) : 0,
      server: totalReviews ? Math.round((issueTypes.server || 0) / totalReviews * 100) : 0,
      both: totalReviews ? Math.round((issueTypes.both || 0) / totalReviews * 100) : 0,
    };

    // Calculate conflicting mods
    const conflictingMods = modReviews.reduce((acc: any, review: any) => {
      if (review && Array.isArray(review.conflictingMods)) {
        review.conflictingMods.forEach((mod: string) => {
          acc[mod] = (acc[mod] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const sortedConflictingMods = Object.entries(conflictingMods)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      mod,
      reviews: modReviews,
      statistics: {
        issueStats,
        conflictingMods: sortedConflictingMods,
      }
    });
  } catch (error: any) {
    // Log detallado
    console.error('[GET] Error al obtener el mod:', {
      message: error?.message,
      stack: error?.stack,
      params,
    });

    // En desarrollo, puedes enviar el error completo. En producción, solo el mensaje.
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      {
        error: 'Error al obtener el mod',
        ...(isDev && { details: error?.message || error?.toString() }),
      },
      { status: 500 }
    );
  }
}
