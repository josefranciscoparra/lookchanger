import { NextRequest, NextResponse } from 'next/server'
import { editGeneratedImage } from '@/lib/gemini'
import { createOutput } from '@/lib/database'
import { saveGeneratedImageToStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Configuración de costos
const CREDITS_PER_EDIT = parseInt(process.env.CREDITS_PER_IMAGE || '1')

export async function POST(req: NextRequest) {
  // Verificar autenticación
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const {
      imageUrl,
      editInstructions,
      outputId
    } = await req.json()

    if (!imageUrl || !editInstructions) {
      return NextResponse.json({
        error: 'Se requiere la URL de la imagen y las instrucciones de edición'
      }, { status: 400 })
    }

    // **Verificar créditos antes de editar**
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Error checking credits:', creditError)
      return NextResponse.json({ error: 'Error al verificar créditos' }, { status: 500 })
    }

    const currentCredits = creditData?.credits || 0

    if (currentCredits < CREDITS_PER_EDIT) {
      return NextResponse.json({
        error: 'Créditos insuficientes',
        current_credits: currentCredits,
        required_credits: CREDITS_PER_EDIT,
        credits_needed: CREDITS_PER_EDIT - currentCredits
      }, { status: 402 }) // 402 Payment Required
    }

    console.log(`[Edit] Editando imagen con instrucciones: "${editInstructions}"`)

    // Obtener el job_id del output original (si existe)
    let jobId = null
    if (outputId) {
      const { data: outputData } = await supabase
        .from('outputs')
        .select('job_id')
        .eq('id', outputId)
        .single()

      jobId = outputData?.job_id || null
    }

    // Llamar a Gemini para editar la imagen
    const editedImageUrl = await editGeneratedImage({
      imageUrl,
      editInstructions
    })

    if (!editedImageUrl) {
      return NextResponse.json({
        error: 'No se pudo editar la imagen. Verifica tu API key o intenta con otras instrucciones'
      }, { status: 500 })
    }

    // Guardar imagen editada en Storage
    const savedImageUrl = await saveGeneratedImageToStorage(
      editedImageUrl,
      jobId || 'edit',
      Date.now()
    )
    const finalUrl = savedImageUrl || editedImageUrl

    // Crear nuevo output en DB vinculado al job original
    let newOutputId = null
    if (jobId) {
      newOutputId = await createOutput(supabase, jobId, finalUrl, {
        is_edit: true,
        original_output_id: outputId,
        edit_instructions: editInstructions,
        original_data_url: editedImageUrl
      })
    }

    // **Consumir créditos**
    try {
      const { data, error: consumeError } = await supabase.rpc('consume_credits', {
        p_user_id: user.id,
        p_job_id: jobId,
        p_amount: CREDITS_PER_EDIT,
        p_description: `Edición de imagen generada`,
        p_metadata: {
          is_edit: true,
          original_output_id: outputId,
          edit_instructions: editInstructions
        }
      })

      if (consumeError) {
        console.error('Error consuming credits:', consumeError)
        // Las imágenes ya se generaron, pero el cobro falló
      } else {
        console.log(`✅ ${CREDITS_PER_EDIT} crédito(s) consumidos por edición`)
      }
    } catch (creditErr) {
      console.error('Exception consuming credits:', creditErr)
    }

    return NextResponse.json({
      editedImageUrl: finalUrl,
      outputId: newOutputId
    })
  } catch (error) {
    console.error('Error editando imagen:', error)
    return NextResponse.json({
      error: 'Error interno al editar la imagen'
    }, { status: 500 })
  }
}
