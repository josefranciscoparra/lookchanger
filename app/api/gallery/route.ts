import { NextResponse } from 'next/server'
import { getUserGeneratedImages } from '@/lib/database'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DISPUTE_WINDOW_DAYS = parseInt(process.env.DISPUTE_WINDOW_DAYS || '7')

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
      total: enrichedImages.reduce((total, group) => total + group.outputs.length, 0)
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
