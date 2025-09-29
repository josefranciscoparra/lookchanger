import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH - Soft delete/restore garment (toggle active status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { active } = await req.json()

  if (typeof active !== 'boolean') {
    return Response.json({ error: 'Campo "active" requerido' }, { status: 400 })
  }

  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // Actualizar el estado active de la prenda
    const { error } = await supabase
      .from('garments')
      .update({ active })
      .eq('id', id)
      .eq('user_id', user.id) // Asegurar que el usuario solo puede modificar sus propias prendas

    if (error) {
      console.error('Error updating garment:', error)
      return Response.json({ error: 'Error al actualizar prenda' }, { status: 500 })
    }

    return Response.json({ ok: true, id, active })
  } catch (err) {
    console.error('Error in PATCH /api/garments/[id]:', err)
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}