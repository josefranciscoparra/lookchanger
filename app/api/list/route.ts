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
        .select('image_url')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching from Supabase:', error)
        return Response.json({ urls: memory[type] || [] })
      }
      
      const urls = data?.map(item => item.image_url) || []
      return Response.json({ urls })
    } catch (err) {
      console.error('Error in Supabase GET:', err)
      return Response.json({ urls: memory[type] || [] })
    }
  } else {
    // Modo demo
    return Response.json({ urls: memory[type] || [] })
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