'use client'
import { useState } from 'react'

export default function GarmentsPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploaded, setUploaded] = useState<string[]>([])

  const onUpload = async () => {
    const body = new FormData()
    files.forEach(f => body.append('files', f))
    const res = await fetch('/api/upload?type=garment', { method: 'POST', body })
    const json = await res.json()
    setUploaded(json.urls || [])
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Prendas</h1>
      <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files || []))} />
      <button className="px-3 py-2 bg-black text-white rounded" onClick={onUpload}>Subir</button>
      <div className="grid grid-cols-3 gap-3">
        {uploaded.map(u => <img key={u} src={u} className="w-full rounded" />)}
      </div>
    </div>
  )
}