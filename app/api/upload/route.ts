import { NextRequest, NextResponse } from 'next/server'
import { saveFilesToTmp } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const files = form.getAll('files').filter(x => x instanceof File) as File[]
  if (!files.length) return NextResponse.json({ error: 'no files' }, { status: 400 })
const { urls } = await saveFilesToTmp(files)
// record in memory (demo)
await fetch(new URL('/api/list', req.url), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: req.nextUrl.searchParams.get('type') || 'model', urls }) })
return NextResponse.json({ urls })
}