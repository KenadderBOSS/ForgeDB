import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET() {
  try {
    console.log('📂 Intentando leer users.json...')
    
    // Posibles ubicaciones del archivo
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'users.json'),
      path.join(process.cwd(), 'users.json'),
      path.join(process.cwd(), 'public', 'users.json'),
      path.join(process.cwd(), 'src', 'data', 'users.json'),
    ]
    
    let users = []
    let foundPath = null
    
    for (const filePath of possiblePaths) {
      try {
        console.log('🔍 Probando ruta:', filePath)
        const fileContents = await fs.readFile(filePath, 'utf8')
        users = JSON.parse(fileContents)
        foundPath = filePath
        console.log('✅ Archivo encontrado en:', filePath)
        console.log('👥 Usuarios cargados:', users.length)
        break
      } catch (error) {
        console.log('❌ No encontrado en:', filePath)
      }
    }
    
    if (!foundPath) {
      throw new Error('users.json no encontrado en ninguna ubicación')
    }
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('❌ Error reading users.json:', error)
    return NextResponse.json([], { status: 500 })
  }
}