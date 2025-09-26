import { NextRequest, NextResponse } from 'next/server'
import { getUserGeneratedImages } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') // Opcional: filtrar por usuario
    
    const generatedImages = await getUserGeneratedImages(userId || undefined)
    
    return NextResponse.json({ 
      success: true,
      images: generatedImages,
      total: generatedImages.reduce((total, group) => total + group.outputs.length, 0)
    })
  } catch (error) {
    console.error('Error fetching generated images:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Error al obtener las imágenes generadas',
      images: [],
      total: 0
    }, { status: 500 })
  }
}