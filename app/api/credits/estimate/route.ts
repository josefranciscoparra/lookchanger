import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Configuración de costos
const CREDITS_PER_IMAGE = parseInt(process.env.CREDITS_PER_IMAGE || '1')

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { variants = 1 } = await req.json()

    // Validar número de variantes
    if (variants < 1 || variants > 4) {
      return NextResponse.json({
        error: 'El número de variantes debe estar entre 1 y 4'
      }, { status: 400 })
    }

    // Calcular costo total
    const totalCost = variants * CREDITS_PER_IMAGE

    // Obtener balance actual del usuario
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Error fetching user credits:', creditError)
      return NextResponse.json({ error: 'Error al verificar créditos' }, { status: 500 })
    }

    const currentCredits = creditData?.credits || 0
    const hasSufficientCredits = currentCredits >= totalCost
    const creditsNeeded = hasSufficientCredits ? 0 : totalCost - currentCredits

    return NextResponse.json({
      success: true,
      cost: totalCost,
      cost_per_image: CREDITS_PER_IMAGE,
      variants,
      current_credits: currentCredits,
      has_sufficient_credits: hasSufficientCredits,
      credits_needed: creditsNeeded
    })
  } catch (error) {
    console.error('Error in credits/estimate:', error)
    return NextResponse.json({ error: 'Error al calcular costo' }, { status: 500 })
  }
}