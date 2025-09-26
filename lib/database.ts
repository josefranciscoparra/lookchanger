import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type OutfitJob = {
  id: string
  user_id?: string
  model_ids: string[]
  garment_ids: string[]
  style_json?: any
  status: 'queued' | 'running' | 'completed' | 'failed'
  cost_cents: number
  created_at: string
}

export type Output = {
  id: string
  job_id: string
  image_url: string
  meta?: any
  created_at: string
}

export async function createOutfitJob(
  modelIds: string[], 
  garmentIds: string[], 
  styleConfig?: any,
  userId?: string
): Promise<string | null> {
  if (!supabase) {
    console.log('[database] Supabase no configurado')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('outfit_jobs')
      .insert({
        user_id: userId,
        model_ids: modelIds,
        garment_ids: garmentIds,
        style_json: styleConfig,
        status: 'running',
        cost_cents: 50 // Costo por generación
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating outfit job:', error)
      return null
    }
    
    return data.id
  } catch (err) {
    console.error('Error creating job:', err)
    return null
  }
}

export async function updateJobStatus(jobId: string, status: 'completed' | 'failed'): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { error } = await supabase
      .from('outfit_jobs')
      .update({ status })
      .eq('id', jobId)
    
    if (error) {
      console.error('Error updating job status:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error updating job status:', err)
    return false
  }
}

export async function createOutput(jobId: string, imageUrl: string, meta?: any): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { error } = await supabase
      .from('outputs')
      .insert({
        job_id: jobId,
        image_url: imageUrl,
        meta
      })
    
    if (error) {
      console.error('Error creating output:', error)
      return false
    }
    
    return true
  } catch (err) {
    console.error('Error creating output:', err)
    return false
  }
}

export async function getUserGeneratedImages(userId?: string): Promise<{ job: OutfitJob; outputs: Output[] }[]> {
  if (!supabase) {
    console.log('[database] Supabase no configurado, retornando array vacío')
    return []
  }
  
  try {
    // Obtener jobs completados del usuario (o todos si no hay userId)
    const jobsQuery = supabase
      .from('outfit_jobs')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    if (userId) {
      jobsQuery.eq('user_id', userId)
    }
    
    const { data: jobs, error: jobsError } = await jobsQuery
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError)
      return []
    }
    
    if (!jobs || jobs.length === 0) {
      return []
    }
    
    // Obtener outputs para cada job
    const results: { job: OutfitJob; outputs: Output[] }[] = []
    
    for (const job of jobs) {
      const { data: outputs, error: outputsError } = await supabase
        .from('outputs')
        .select('*')
        .eq('job_id', job.id)
        .order('created_at', { ascending: true })
      
      if (outputsError) {
        console.error('Error fetching outputs for job:', job.id, outputsError)
        continue
      }
      
      results.push({
        job: job as OutfitJob,
        outputs: outputs as Output[] || []
      })
    }
    
    return results
  } catch (err) {
    console.error('Error fetching user generated images:', err)
    return []
  }
}