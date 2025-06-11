import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define the absolute path to the mods.json file
const modsFilePath = path.join(process.cwd(), 'data', 'mods.json');

// Helper function: read JSON file safely
async function readModsFile() {
  try {
    const data = await fs.readFile(modsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file does not exist, return empty array
    return [];
  }
}

// GET method: Return all mods
export async function GET() {
  try {
    const mods = await readModsFile();
    console.log("modsFilePath:", modsFilePath);
    console.log("mods:", mods);
    return NextResponse.json({ mods }, { status: 200 });
  } catch (error: any) {
    console.error("Error reading mods data:", error);
    return NextResponse.json({ error: 'Error al leer los datos de mods' }, { status: 500 });
  }
}

// POST method: Add a new mod
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, bannerUrl } = body;

    // Validate required fields
    if (!name || !description || !bannerUrl) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate image URL
    try {
      const urlObj = new URL(bannerUrl);
      const allowedDomains = [
        'images.pexels.com',
        'api.dicebear.com',
        'files.yande.re',
        'konachan.com'
      ];
      if (!allowedDomains.some(domain => urlObj.hostname === domain)) {
        return NextResponse.json({ 
          error: 'La URL de la imagen debe ser de uno de los dominios permitidos' 
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ 
        error: 'URL de imagen inválida' 
      }, { status: 400 });
    }

    // Create new mod object
    const newMod = {
      id: Date.now().toString(),
      name,
      description,
      bannerUrl,
      reviewCount: 0,
      averageRating: 0.0,
    };

    // Read existing mods
    const mods = await readModsFile();
    mods.push(newMod);

    // Write updated mods back to file
    await fs.writeFile(modsFilePath, JSON.stringify(mods, null, 2));

    // Send success response with file location
    return NextResponse.json({
      message: 'Mod agregado exitosamente',
      fileModified: modsFilePath,
      mod: newMod,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ocurrió un error al guardar el mod.' }, { status: 500 });
  }
}
