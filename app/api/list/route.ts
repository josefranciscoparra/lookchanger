import { createClient } from '@supabase/supabase-js'

let memory: Record<string, string[]> = { model: [], garment: [] }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'model'
  
  if (supabase) {
    try {
      const tableName = type === 'model' ? 'models' : 'garments'
      const { data, error } = await supabase
        .from(tableName)
        .select('id, image_url, created_at, category')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching from Supabase:', error)
        const urls = memory[type] || []
        const items = urls.map((url, index) => ({ id: `demo-${index}`, url, created_at: new Date().toISOString() }))
        return Response.json({ items })
      }
      
      const items = data?.map(item => ({
        id: item.id,
        url: item.image_url,
        created_at: item.created_at,
        category: item.category
      })) || []
      return Response.json({ items })
    } catch (err) {
      console.error('Error in Supabase GET:', err)
      const urls = memory[type] || []
      const items = urls.map((url, index) => ({ id: `demo-${index}`, url, created_at: new Date().toISOString() }))
      return Response.json({ items })
    }
  } else {
    // Modo demo
    const urls = memory[type] || []
    const items = urls.map((url, index) => ({ id: `demo-${index}`, url, created_at: new Date().toISOString() }))
    return Response.json({ items })
  }
}

export async function POST(req: Request) {
  const { type, urls } = await req.json()
  
  if (supabase && urls?.length > 0) {
    try {
      const tableName = type === 'model' ? 'models' : 'garments'
      const records = urls.map((url: string) => ({ image_url: url }))
      
      const { error } = await supabase
        .from(tableName)
        .insert(records)
      
      if (error) {
        console.error('Error inserting to Supabase:', error)
        // Fallback a memoria
        if (!memory[type]) memory[type] = []
        memory[type].push(...urls)
      }
    } catch (err) {
      console.error('Error in Supabase POST:', err)
      // Fallback a memoria
      if (!memory[type]) memory[type] = []
      memory[type].push(...urls)
    }
  } else {
    // Modo demo
    if (!memory[type]) memory[type] = []
    memory[type].push(...(urls || []))
  }
  
  return Response.json({ ok: true })
}