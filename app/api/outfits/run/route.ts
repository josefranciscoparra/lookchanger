import { NextRequest, NextResponse } from 'next/server'
import { generateLook } from '@/lib/gemini'
import { createOutfitJob, updateJobStatus, createOutput } from '@/lib/database'
import { saveGeneratedImageToStorage } from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    console.log(`Generando ${variants} variantes con ${modelUrls.length} modelos y ${garmentUrls.length} prendas`)
    
    // Crear job en la base de datos
    const jobId = await createOutfitJob(
      supabase,
      modelUrls, 
      garmentUrls, 
      useAdvancedStyle ? style : undefined,
      user.id
    )
    
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
      // Marcar job como fallido si no hay outputs
      if (jobId) {
        await updateJobStatus(supabase, jobId, 'failed')
      }
      return NextResponse.json({ 
        error: 'No se pudieron generar imágenes. Verifica tu API key de Gemini' 
      }, { status: 500 })
    }
    
    // Guardar imágenes generadas en Storage y crear outputs en DB
    const savedOutputs = []
    if (jobId) {
      for (let i = 0; i < outputs.length; i++) {
        const imageUrl = outputs[i]
        
        // Guardar imagen en Storage
        const savedImageUrl = await saveGeneratedImageToStorage(imageUrl, jobId, i)
        const finalUrl = savedImageUrl || imageUrl // Fallback a original si falla el guardado
        
        // Crear output en DB
        await createOutput(supabase, jobId, finalUrl, { 
          variant_index: i, 
          original_data_url: imageUrl 
        })
        
        savedOutputs.push(finalUrl)
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
