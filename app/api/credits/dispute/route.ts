import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const DISPUTE_WINDOW_DAYS = parseInt(process.env.DISPUTE_WINDOW_DAYS || '7')

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { output_id, reason, description = '' } = await req.json()

    if (!output_id || !reason) {
      return NextResponse.json({
        error: 'Se requiere output_id y razón de la disputa'
      }, { status: 400 })
    }

    // Obtener información del output
    const { data: output, error: outputError } = await supabase
      .from('outputs')
      .select('id, job_id, status, created_at')
      .eq('id', output_id)
      .single()

    if (outputError || !output) {
      return NextResponse.json({ error: 'Output no encontrado' }, { status: 404 })
    }

    // Verificar que el output pertenece a un job del usuario
    const { data: job, error: jobError } = await supabase
      .from('outfit_jobs')
      .select('user_id')
      .eq('id', output.job_id)
      .single()

    if (jobError || !job || job.user_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para disputar este output' }, { status: 403 })
    }

    // Verificar que no esté ya disputado o reembolsado
    if (output.status === 'disputed') {
      return NextResponse.json({ error: 'Este output ya está en disputa' }, { status: 400 })
    }

    if (output.status === 'refunded') {
      return NextResponse.json({ error: 'Este output ya fue reembolsado' }, { status: 400 })
    }

    // Verificar que esté dentro del periodo de disputa
    const createdAt = new Date(output.created_at)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > DISPUTE_WINDOW_DAYS) {
      return NextResponse.json({
        error: `El periodo de disputa ha expirado (${DISPUTE_WINDOW_DAYS} días)`
      }, { status: 400 })
    }

    // Marcar output como disputado
    const { error: updateError } = await supabase
      .from('outputs')
      .update({
        status: 'disputed',
        dispute_reason: reason,
        disputed_at: new Date().toISOString()
      })
      .eq('id', output_id)

    if (updateError) {
      console.error('Error updating output status:', updateError)
      return NextResponse.json({ error: 'Error al procesar la disputa' }, { status: 500 })
    }

    // TODO: En el futuro, enviar notificación al admin o procesar automáticamente
    // Por ahora, la disputa queda registrada para revisión manual

    return NextResponse.json({
      success: true,
      message: 'Disputa registrada correctamente. Será revisada pronto.',
      output_id,
      reason,
      dispute_window_remaining_days: DISPUTE_WINDOW_DAYS - daysDiff
    })
  } catch (error) {
    console.error('Error in credits/dispute:', error)
    return NextResponse.json({ error: 'Error al procesar la disputa' }, { status: 500 })
  }
}