export type UploadResult = { urls: string[] }

// Modo demo: guarda en /tmp via route handler y expone con data URLs
// En producción: usa Supabase Storage o S3 y devuelve URLs públicas.

export async function saveFilesToTmp(files: File[]): Promise<UploadResult> {
  const urls: string[] = []
  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer())
    const b64 = buf.toString('base64')
    const mime = f.type || 'image/png'
    urls.push(`data:${mime};base64,${b64}`)
  }
  return { urls }
}