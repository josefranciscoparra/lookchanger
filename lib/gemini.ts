import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) console.warn('[gemini] GEMINI_API_KEY no está definido (modo demo)')

const client = new GoogleGenerativeAI({ apiKey: API_KEY || 'demo' })

export async function generateLook({
  modelUrls,
  garmentUrls,
  variants = 2
}: { modelUrls: string[], garmentUrls: string[], variants?: number }): Promise<string[]> {
  // Si no hay API_KEY, devolvemos imágenes "eco" (echo) para demo
  if (!API_KEY) {
    return garmentUrls.slice(0, variants).map((g, i) => g)
  }

  const toInline = (dataUrl: string) => {
    // admite data:URL o URL remota (en prod descarga binario)
    if (dataUrl.startsWith('data:')) {
      const [head, b64] = dataUrl.split(',', 2)
      const mime = head.split(':')[1].split(';')[0]
      return { inlineData: { mimeType: mime, data: b64 } }
    }
    // simple: referencia remota
    return { fileData: { mimeType: 'image/png', fileUri: dataUrl } as any }
  }

  const parts: any[] = [
    { text:
`You are a fashion virtual try-on editor.
- Keep the PERSON's face and hair identical.
- Fit the DRESS naturally to the body (fabric folds, neckline alignment).
- Add extra garments (shoes/bag) matching perspective.
- Photorealistic, studio soft light, neutral background.
Return ${variants} images.` }
  ]

  for (const m of modelUrls) parts.push(toInline(m))
  for (const g of garmentUrls) { parts.push({ text: 'GARMENT:' }); parts.push(toInline(g)) }

  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  const res = await model.generateContent({
    contents: [{ role: 'user', parts }]
  })

  const outs: string[] = []
  for (const cand of res.candidates ?? []) {
    for (const part of (cand.content?.parts ?? [])) {
      const data = (part as any)?.inlineData?.data
      if (data) outs.push(`data:image/png;base64,${data}`)
    }
  }
  return outs
}