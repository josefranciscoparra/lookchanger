import { NextRequest, NextResponse } from 'next/server'
import { saveFilesToTmp } from '@/lib/storage'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const files = form.getAll('files').filter(x => x instanceof File) as File[]
    const categories = form.getAll('categories') as string[]
    const type = req.nextUrl.searchParams.get('type') || 'model'

    // Obtener datos físicos del modelo (si los hay)
    const weight = form.get('weight') as string | null
    const height = form.get('height') as string | null
    const bodyType = form.get('body_type') as string | null
    const usePhysicalInfo = form.get('use_physical_info') === 'true'

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!files.length) {
      return NextResponse.json({ error: 'No se han seleccionado archivos' }, { status: 400 })
    }

    // Validar que cada archivo tenga una categoría (para prendas)
    if (type === 'garment' && categories.length !== files.length) {
      return NextResponse.json({ error: 'Cada prenda debe tener una categoría asignada' }, { status: 400 })
    }

    // Validar archivos
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: `El archivo ${file.name} es muy grande (máximo 10MB)`
        }, { status: 400 })
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `Tipo de archivo no válido: ${file.type}. Solo se permiten imágenes JPG, PNG y WebP`
        }, { status: 400 })
      }
    }

    const { urls } = await saveFilesToTmp(files)
    const tableName = type === 'garment' ? 'garments' : 'models'

    const records = urls.map((url, index) => {
      const baseRecord = {
        image_url: url,
        user_id: user.id
      }

      // Añadir categoría para prendas
      if (type === 'garment') {
        return { ...baseRecord, category: categories[index] ?? null }
      }

      // Añadir datos físicos para modelos
      if (type === 'model' && usePhysicalInfo) {
        return {
          ...baseRecord,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          body_type: bodyType || null,
          use_physical_info: true
        }
      }

      return baseRecord
    })

    const { error } = await supabase.from(tableName).insert(records)

    if (error) {
      console.error('Error saving uploaded files to Supabase:', error)
      return NextResponse.json({ error: 'Error al guardar datos' }, { status: 500 })
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json({
      error: 'Error interno del servidor al procesar los archivos'
    }, { status: 500 })
  }
}
