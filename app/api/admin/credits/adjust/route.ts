import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Lista de emails de administradores (en el futuro esto debería estar en BD)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar que el usuario es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  if (!profile || !ADMIN_EMAILS.includes(profile.email || '')) {
    return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
  }

  try {
    const { target_user_id, amount, reason, metadata = null } = await req.json()

    if (!target_user_id || amount === undefined || !reason) {
      return NextResponse.json({
        error: 'Se requiere target_user_id, amount y reason'
      }, { status: 400 })
    }

    // Validar que amount sea un número
    const parsedAmount = parseInt(amount)
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ error: 'amount debe ser un número' }, { status: 400 })
    }

    // Verificar que el usuario destino existe
    const { data: targetUserCredits, error: targetError } = await supabase
      .from('user_credits')
      .select('user_id, credits')
      .eq('user_id', target_user_id)
      .single()

    if (targetError && targetError.code === 'PGRST116') {
      // Usuario no tiene registro de créditos, crearlo
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: target_user_id, credits: 0 })

      if (insertError) {
        return NextResponse.json({ error: 'Error al crear registro de créditos' }, { status: 500 })
      }
    }

    // Llamar a la función SQL para ajustar créditos
    const { data, error } = await supabase.rpc('admin_adjust_credits', {
      p_user_id: target_user_id,
      p_amount: parsedAmount,
      p_reason: reason,
      p_metadata: metadata
    })

    if (error) {
      console.error('Error adjusting credits:', error)
      return NextResponse.json({ error: 'Error al ajustar créditos: ' + error.message }, { status: 500 })
    }

    // Obtener nuevo balance
    const { data: newBalance } = await supabase
      .from('user_credits')
      .select('credits, total_spent, total_purchased')
      .eq('user_id', target_user_id)
      .single()

    return NextResponse.json({
      success: true,
      message: `Créditos ajustados correctamente: ${parsedAmount > 0 ? '+' : ''}${parsedAmount}`,
      target_user_id,
      amount: parsedAmount,
      reason,
      new_balance: newBalance?.credits || 0,
      total_spent: newBalance?.total_spent || 0,
      total_purchased: newBalance?.total_purchased || 0
    })
  } catch (error) {
    console.error('Error in admin/credits/adjust:', error)
    return NextResponse.json({ error: 'Error al ajustar créditos' }, { status: 500 })
  }
}