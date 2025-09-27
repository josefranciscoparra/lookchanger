import { NextResponse } from 'next/server'
import { getUserGeneratedImages } from '@/lib/database'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado',
        images: [],
        total: 0
      }, { status: 401 })
    }

    const generatedImages = await getUserGeneratedImages(supabase, user.id)
    
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
