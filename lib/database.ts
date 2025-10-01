import type { SupabaseClient } from '@supabase/supabase-js'

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
  supabase: SupabaseClient,
  modelIds: string[], 
  garmentIds: string[], 
  styleConfig: any | undefined,
  userId: string
): Promise<string | null> {
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

export async function updateJobStatus(
  supabase: SupabaseClient,
  jobId: string, 
  status: 'completed' | 'failed'
): Promise<boolean> {
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

export async function createOutput(
  supabase: SupabaseClient,
  jobId: string, 
  imageUrl: string, 
  meta: any | undefined
): Promise<boolean> {
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

export async function getUserGeneratedImagesCount(
  supabase: SupabaseClient,
  userId?: string
): Promise<number> {
  try {
    let query = supabase
      .from('outfit_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting jobs:', error)
      return 0
    }

    return count || 0
  } catch (err) {
    console.error('Error counting user generated images:', err)
    return 0
  }
}

export async function getUserGeneratedImages(
  supabase: SupabaseClient,
  userId?: string,
  limit?: number,
  offset?: number
): Promise<{ job: OutfitJob; outputs: Output[] }[]> {
  try {
    let jobsQuery = supabase
      .from('outfit_jobs')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (userId) {
      jobsQuery = jobsQuery.eq('user_id', userId)
    }

    // Aplicar paginación si se especifica
    if (limit !== undefined && offset !== undefined) {
      jobsQuery = jobsQuery.range(offset, offset + limit - 1)
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
