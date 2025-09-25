
'use client'
import { useEffect, useState } from 'react'

export default function OutfitsPage() {
  const [models, setModels] = useState<string[]>([])
  const [garments, setGarments] = useState<string[]>([])
  const [outputs, setOutputs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/list?type=model').then(r => r.json()).then(d => setModels(d.urls || []))
    fetch('/api/list?type=garment').then(r => r.json()).then(d => setGarments(d.urls || []))
  }, [])

  const run = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/outfits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelUrls: models.slice(0,1),     // simple: usa la primera
          garmentUrls: garments.slice(0,3), // simple: hasta 3 prendas
          variants: 2
        })
      })
      const json = await res.json()
      setOutputs(json.outputs || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Outfits</h1>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={run} disabled={loading}>
          {loading ? 'Generando…' : 'Generar look'}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {outputs.map(u => <img key={u} src={u} className="w-full rounded" />)}
      </div>
    </div>
  )
}
