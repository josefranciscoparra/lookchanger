import { NextRequest, NextResponse } from 'next/server'
import { generateLook } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { modelUrls = [], garmentUrls = [], variants = 2 } = await req.json()
    
    if (!modelUrls.length || !garmentUrls.length) {
      return NextResponse.json({ 
        error: 'Se requieren URLs de modelo y prendas para generar el look' 
      }, { status: 400 })
    }

    if (variants < 1 || variants > 4) {
      return NextResponse.json({ 
        error: 'El número de variantes debe estar entre 1 y 4' 
      }, { status: 400 })
    }

    console.log(`Generando ${variants} variantes con ${modelUrls.length} modelos y ${garmentUrls.length} prendas`)
    
    const outputs = await generateLook({ modelUrls, garmentUrls, variants })
    
    if (!outputs.length) {
      return NextResponse.json({ 
        error: 'No se pudieron generar imágenes. Verifica tu API key de Gemini' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ outputs })
  } catch (error) {
    console.error('Error generando look:', error)
    return NextResponse.json({ 
      error: 'Error interno al generar el look. Revisa la configuración de Gemini AI' 
    }, { status: 500 })
  }
}