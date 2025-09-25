export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI Look Try-On</h1>
      <p className="text-gray-700">Sube fotos de una modelo y de prendas para generar looks fotorrealistas.</p>
      <ul className="list-disc pl-5 text-gray-700">
        <li>1–N fotos de modelo (caras/poses distintas).</li>
        <li>1–N fotos de prendas (fondo neutro, 1024–2048px).</li>
      </ul>
    </div>
  )
}