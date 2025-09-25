import { NextRequest, NextResponse } from 'next/server'
import { saveFilesToTmp } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const files = form.getAll('files').filter(x => x instanceof File) as File[]
    
    if (!files.length) {
      return NextResponse.json({ error: 'No se han seleccionado archivos' }, { status: 400 })
    }

    // Validar archivos
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `El archivo ${file.name} es muy grande (máximo 10MB)` 
        }, { status: 400 })
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `Tipo de archivo no válido: ${file.type}. Solo se permiten imágenes JPG, PNG y WebP` 
        }, { status: 400 })
      }
    }

    const { urls } = await saveFilesToTmp(files)
    
    // Registrar en memoria (modo demo)
    await fetch(new URL('/api/list', req.url), { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        type: req.nextUrl.searchParams.get('type') || 'model', 
        urls 
      }) 
    })
    
    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar los archivos' 
    }, { status: 500 })
  }
}