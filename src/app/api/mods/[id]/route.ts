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
    return [];
  }
}

async function readReviewsFile() {
  try {
    const data = await fs.readFile(reviewsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mods = await readModsFile();
    const reviews = await readReviewsFile();
    
    const mod = mods.find((m: any) => m.id === params.id);
    if (!mod) {
      return NextResponse.json(
        { error: 'Mod no encontrado' },
        { status: 404 }
      );
    }

    // Get reviews for this mod
    const modReviews = reviews.filter((r: any) => r.modId === params.id);

    // Calculate statistics
    const issueTypes = modReviews.reduce((acc: any, review: any) => {
      acc[review.issueType] = (acc[review.issueType] || 0) + 1;
      return acc;
    }, {});

    const totalReviews = modReviews.length;
    const issueStats = {
      client: Math.round((issueTypes.client || 0) / totalReviews * 100) || 0,
      server: Math.round((issueTypes.server || 0) / totalReviews * 100) || 0,
      both: Math.round((issueTypes.both || 0) / totalReviews * 100) || 0,
    };

    // Calculate conflicting mods
    const conflictingMods = modReviews.reduce((acc: any, review: any) => {
      review.conflictingMods.forEach((mod: string) => {
        acc[mod] = (acc[mod] || 0) + 1;
      });
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
    console.error('Error fetching mod:', error);
    return NextResponse.json(
      { error: 'Error al obtener el mod' },
      { status: 500 }
    );
  }
}
