import { createClient } from '@supabase/supabase-js'

export type UploadResult = { urls: string[] }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function saveFilesToTmp(files: File[]): Promise<UploadResult> {
  const urls: string[] = []

  // Si Supabase está configurado, usar Storage
  if (supabase) {
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Error uploading to Supabase:', error)
          // Fallback a modo demo
          const buf = Buffer.from(await file.arrayBuffer())
          const b64 = buf.toString('base64')
          const mime = file.type || 'image/png'
          urls.push(`data:${mime};base64,${b64}`)
        } else {
          // Obtener URL pública
          const { data: publicData } = supabase.storage
            .from('images')
            .getPublicUrl(fileName)
          
          urls.push(publicData.publicUrl)
        }
      } catch (err) {
        console.error('Error processing file:', err)
        // Fallback a modo demo
        const buf = Buffer.from(await file.arrayBuffer())
        const b64 = buf.toString('base64')
        const mime = file.type || 'image/png'
        urls.push(`data:${mime};base64,${b64}`)
      }
    }
  } else {
    // Modo demo: usar data URLs
    console.log('[storage] Usando modo demo - Supabase no configurado')
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer())
      const b64 = buf.toString('base64')
      const mime = f.type || 'image/png'
      urls.push(`data:${mime};base64,${b64}`)
    }
  }

  return { urls }
}