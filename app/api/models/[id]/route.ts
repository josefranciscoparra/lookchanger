import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH - Update model (soft delete/restore or update physical info)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await req.json()

  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // Preparar los datos a actualizar
    const updateData: any = {}

    // Si se está actualizando el estado active
    if ('active' in body) {
      if (typeof body.active !== 'boolean') {
        return Response.json({ error: 'Campo "active" debe ser booleano' }, { status: 400 })
      }
      updateData.active = body.active
    }

    // Si se están actualizando datos físicos
    if ('use_physical_info' in body) {
      updateData.use_physical_info = body.use_physical_info
      updateData.weight = body.weight || null
      updateData.height = body.height || null
      updateData.body_type = body.body_type || null
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No hay datos para actualizar' }, { status: 400 })
    }

    // Actualizar el modelo
    const { error } = await supabase
      .from('models')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Asegurar que el usuario solo puede modificar sus propios modelos

    if (error) {
      console.error('Error updating model:', error)
      return Response.json({ error: 'Error al actualizar modelo' }, { status: 500 })
    }

    return Response.json({ ok: true, id, ...updateData })
  } catch (err) {
    console.error('Error in PATCH /api/models/[id]:', err)
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}