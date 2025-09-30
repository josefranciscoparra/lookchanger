import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // Filtro opcional por tipo

    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Aplicar filtro de tipo si existe
    if (type && ['purchase', 'consumption', 'refund', 'admin_adjustment'].includes(type)) {
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactions: data || [],
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in credits/transactions:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}