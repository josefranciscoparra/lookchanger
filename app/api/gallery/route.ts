import { NextResponse } from 'next/server'
import { getUserGeneratedImages, getUserGeneratedImagesCount } from '@/lib/database'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DISPUTE_WINDOW_DAYS = parseInt(process.env.DISPUTE_WINDOW_DAYS || '7')
const DEFAULT_PAGE_SIZE = 6

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No autenticado',
        images: [],
        total: 0,
        currentPage: 1,
        totalPages: 0
      }, { status: 401 })
    }

    // Obtener parámetros de paginación
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))
    const offset = (page - 1) * limit

    // Obtener total de registros y datos paginados en paralelo
    const [totalCount, generatedImages] = await Promise.all([
      getUserGeneratedImagesCount(supabase, user.id),
      getUserGeneratedImages(supabase, user.id, limit, offset)
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Enriquecer cada output con información de créditos y disputas
    const enrichedImages = generatedImages.map(group => {
      const enrichedOutputs = group.outputs.map(output => {
        const createdAt = new Date(output.created_at)
        const now = new Date()
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        const canDispute = daysSinceCreation <= DISPUTE_WINDOW_DAYS

        return {
          ...output,
          can_dispute: canDispute,
          days_since_creation: daysSinceCreation,
          dispute_window_remaining: canDispute ? DISPUTE_WINDOW_DAYS - daysSinceCreation : 0
        }
      })

      return {
        ...group,
        outputs: enrichedOutputs
      }
    })

    return NextResponse.json({
      success: true,
      images: enrichedImages,
      total: totalCount,
      currentPage: page,
      totalPages,
      totalOutputs: enrichedImages.reduce((total, group) => total + group.outputs.length, 0)
    })
  } catch (error) {
    console.error('Error fetching generated images:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener las imágenes generadas',
      images: [],
      total: 0,
      currentPage: 1,
      totalPages: 0
    }, { status: 500 })
  }
}
