import { NextRequest, NextResponse } from 'next/server'
import { generateLook } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { modelUrls = [], garmentUrls = [], variants = 2 } = await req.json()
  if (!modelUrls.length || !garmentUrls.length) {
    return NextResponse.json({ error: 'modelUrls and garmentUrls are required' }, { status: 400 })
  }
  const outputs = await generateLook({ modelUrls, garmentUrls, variants })
  return NextResponse.json({ outputs })
}