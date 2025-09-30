import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    // Obtener balance de créditos del usuario
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, total_spent, total_purchased, updated_at')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Si no existe el registro, crearlo con 0 créditos
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, credits: 0 })
          .select('credits, total_spent, total_purchased, updated_at')
          .single()

        if (insertError) {
          console.error('Error creating user credits:', insertError)
          return NextResponse.json({ error: 'Error al crear registro de créditos' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          credits: newData.credits,
          total_spent: newData.total_spent,
          total_purchased: newData.total_purchased,
          updated_at: newData.updated_at
        })
      }

      console.error('Error fetching credits:', error)
      return NextResponse.json({ error: 'Error al obtener créditos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      credits: data.credits,
      total_spent: data.total_spent,
      total_purchased: data.total_purchased,
      updated_at: data.updated_at
    })
  } catch (error) {
    console.error('Error in credits/balance:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}