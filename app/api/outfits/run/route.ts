import { NextRequest, NextResponse } from 'next/server'
import { generateLook } from '@/lib/gemini'
import { createOutfitJob, updateJobStatus, createOutput } from '@/lib/database'
import { saveGeneratedImageToStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Configuración de costos
const CREDITS_PER_IMAGE = parseInt(process.env.CREDITS_PER_IMAGE || '1')

type VariantType = 'pose' | 'fit' | 'lighting' | 'angle' | 'accessories'

interface VariantConfig {
  id: number
  type: VariantType
  description?: string
}

export async function POST(req: NextRequest) {
  // Verificar autenticación
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const {
      modelUrls = [],
      garmentUrls = [],
      variants = 1,
      variantConfigs = [],
      style = { style: 'casual', season: 'any' },
      useAdvancedStyle = false,
      modelCharacteristics,
      outfitOptions = {
        fullBodyVisible: true,
        showShoes: true,
        hideHatsAndCaps: true,
        adaptShoesToLook: true,
        removeSunglasses: false,
        onlySelectedGarments: false,
        photoStyle: 'original'
      },
      modelId = null
    } = await req.json()

    if (!modelUrls.length || !garmentUrls.length) {
      return NextResponse.json({
        error: 'Se requieren URLs de modelo y prendas para generar el look'
      }, { status: 400 })
    }

    // Obtener información física del modelo si hay modelId
    let physicalInfo = null
    if (modelId) {
      const { data: modelData } = await supabase
        .from('models')
        .select('weight, height, body_type, use_physical_info')
        .eq('id', modelId)
        .eq('user_id', user.id)
        .single()

      console.log('📊 Datos físicos del modelo desde BD:', modelData)

      if (modelData && modelData.use_physical_info) {
        physicalInfo = {
          weight: modelData.weight,
          height: modelData.height,
          bodyType: modelData.body_type
        }
        console.log('✅ Información física activada para el prompt:', physicalInfo)
      } else {
        console.log('❌ Información física NO activada o no disponible')
      }
    } else {
      console.log('⚠️  No se proporcionó modelId')
    }

    if (variants < 1 || variants > 4) {
      return NextResponse.json({
        error: 'El número de variantes debe estar entre 1 y 4'
      }, { status: 400 })
    }

    // **NUEVO: Verificar créditos antes de generar**
    const totalCost = variants * CREDITS_PER_IMAGE

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

    if (currentCredits < totalCost) {
      return NextResponse.json({
        error: 'Créditos insuficientes',
        current_credits: currentCredits,
        required_credits: totalCost,
        credits_needed: totalCost - currentCredits
      }, { status: 402 }) // 402 Payment Required
    }

    console.log(`Generando ${variants} variantes con ${modelUrls.length} modelos y ${garmentUrls.length} prendas (Costo: ${totalCost} créditos)`)
    
    // Crear job en la base de datos (con info de créditos)
    const jobId = await createOutfitJob(
      supabase,
      modelUrls,
      garmentUrls,
      useAdvancedStyle ? style : undefined,
      user.id
    )

    // Actualizar job con información de variantes
    if (jobId) {
      await supabase
        .from('outfit_jobs')
        .update({ variants_requested: variants })
        .eq('id', jobId)
    }
    
    const outputs = await generateLook({
      modelUrls,
      garmentUrls,
      variants,
      variantConfigs,
      style: useAdvancedStyle ? style : undefined,
      modelCharacteristics,
      outfitOptions,
      physicalInfo
    })
    
    if (!outputs.length) {
      // Marcar job como fallido si no hay outputs (NO cobrar créditos)
      if (jobId) {
        await updateJobStatus(supabase, jobId, 'failed')
        await supabase
          .from('outfit_jobs')
          .update({ charge_status: 'failed' })
          .eq('id', jobId)
      }
      return NextResponse.json({
        error: 'No se pudieron generar imágenes. Verifica tu API key de Gemini'
      }, { status: 500 })
    }

    // Guardar imágenes generadas en Storage y crear outputs en DB
    const savedOutputs = []
    let successfulOutputs = 0

    if (jobId) {
      for (let i = 0; i < outputs.length; i++) {
        const imageUrl = outputs[i]

        // Guardar imagen en Storage
        const savedImageUrl = await saveGeneratedImageToStorage(imageUrl, jobId, i)
        const finalUrl = savedImageUrl || imageUrl // Fallback a original si falla el guardado

        // Crear output en DB
        const outputCreated = await createOutput(supabase, jobId, finalUrl, {
          variant_index: i,
          original_data_url: imageUrl
        })

        if (outputCreated) {
          successfulOutputs++
        }

        savedOutputs.push(finalUrl)
      }

      // **NUEVO: Consumir créditos por cada output exitoso**
      if (successfulOutputs > 0) {
        try {
          const { data, error: consumeError } = await supabase.rpc('consume_credits', {
            p_user_id: user.id,
            p_job_id: jobId,
            p_amount: successfulOutputs * CREDITS_PER_IMAGE,
            p_description: `Generación de ${successfulOutputs} imagen${successfulOutputs > 1 ? 'es' : ''} de outfit`,
            p_metadata: {
              variants: successfulOutputs,
              cost_per_image: CREDITS_PER_IMAGE
            }
          })

          if (consumeError) {
            console.error('Error consuming credits:', consumeError)
            // Nota: Las imágenes ya se generaron, pero el cobro falló
            // Esto debería alertar al admin
          } else {
            console.log(`✅ ${successfulOutputs * CREDITS_PER_IMAGE} créditos consumidos exitosamente`)
          }
        } catch (creditErr) {
          console.error('Exception consuming credits:', creditErr)
        }
      }

      // Marcar job como completado
      await updateJobStatus(supabase, jobId, 'completed')
    }
    
    return NextResponse.json({ 
      outputs: savedOutputs.length > 0 ? savedOutputs : outputs,
      jobId 
    })
  } catch (error) {
    console.error('Error generando look:', error)
    return NextResponse.json({ 
      error: 'Error interno al generar el look. Revisa la configuración de Gemini AI' 
    }, { status: 500 })
  }
}
