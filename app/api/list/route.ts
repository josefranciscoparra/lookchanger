let memory: Record<string, string[]> = { model: [], garment: [] }

// Nota: truco simple para demo: guardamos lo último recibido en este proceso.
// Para producción, usa DB/Storage. Aquí lo conectamos desde /api/upload con una pequeña mutación.

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'model'
  return Response.json({ urls: memory[type] || [] })
}

export async function POST(req: Request) {
  const { type, urls } = await req.json()
  if (!memory[type]) memory[type] = []
  memory[type].push(...(urls || []))
  return Response.json({ ok: true })
}