import { createClient } from '@/lib/supabase/server'

interface MemoryItem {
  url: string
  category?: string
  created_at: string
}

let memory: Record<string, MemoryItem[]> = { model: [], garment: [] }

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'model'
  
  const supabase = createClient()
  
  // Verificar si el usuario está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }
  
  try {
    const tableName = type === 'model' ? 'models' : 'garments'
    const columns = type === 'garment'
      ? 'id, image_url, created_at, category'
      : 'id, image_url, created_at'

    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq('user_id', user.id)  // Filtrar por usuario autenticado
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Error fetching from Supabase:', error)
      return Response.json({ error: 'Error al obtener datos' }, { status: 500 })
    }
    
    const items = data?.map(item => ({
      id: item.id,
      url: item.image_url,
      created_at: item.created_at,
      category: 'category' in item ? item.category : undefined
    })) || []
    return Response.json({ items })
  } catch (err) {
    console.error('Error in Supabase GET:', err)
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { type, urls, categories } = await req.json()
  
  const supabase = createClient()
  
  // Verificar si el usuario está autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  if (!urls?.length) {
    return Response.json({ error: 'No se proporcionaron URLs' }, { status: 400 })
  }

  try {
    const tableName = type === 'model' ? 'models' : 'garments'
    const records = urls.map((url: string, index: number) => ({ 
      image_url: url,
      user_id: user.id,  // Asociar al usuario autenticado
      category: type === 'garment' && categories ? categories[index] : null
    }))
    
    const { error } = await supabase
      .from(tableName)
      .insert(records)
    
    if (error) {
      console.error('Error inserting to Supabase:', error)
      return Response.json({ error: 'Error al guardar datos' }, { status: 500 })
    }
    
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Error in Supabase POST:', err)
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
