import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StepCard } from '@/components/StepCard'
import { Accordion } from '@/components/Accordion'

function IconUser() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg> }
function IconShirt() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7l4-3 4 3 4-3 4 3v13H4z"/></svg> }
function IconStars() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 17l-3.5 2 1-4-3-2.6 4-.3L12 8l1.5 4.1 4 .3-3 2.6 1 4z"/></svg> }

export default function Page() {
  return (
    <main className="px-6 py-8">
      {/* Hero */}
      <section className="max-w-3xl">
        <span className="inline-flex items-center text-xs font-medium text-text-secondary bg-white border border-border rounded-lg px-2 py-1 mb-3">
          ⚡ Potenciado por IA
        </span>
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-ink-500">Cambia tu look con IA</h1>
        <p className="text-text-secondary mb-6">
          Sube modelos y prendas, y genera outfits en segundos. Un flujo simple con resultados profesionales.
        </p>
        <div className="flex gap-3">
          <Button variant="accent" asChild>
            <Link href="/outfits">Empezar ahora</Link>
          </Button>
          <Button variant="secondary-minimal" asChild>
            <Link href="/models">Explorar modelos</Link>
          </Button>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StepCard
          icon={<IconUser />}
          title="1. Sube Modelos"
          desc="Agrega fotos de modelos con distintas poses y expresiones."
          cta="Subir modelos"
          href="/models"
          ctaVariant="secondary-minimal"
        />
        <StepCard
          icon={<IconShirt />}
          title="2. Sube Prendas"
          desc="Sube ropa, zapatos y complementos con fondo neutro."
          cta="Subir prendas"
          href="/garments"
          ctaVariant="secondary-minimal"
        />
        <StepCard
          icon={<IconStars />}
          title="3. Genera Outfits"
          desc="Combina modelos y prendas con IA para crear looks únicos."
          cta="Generar outfits"
          href="/outfits"
          ctaVariant="primary"
        />
      </section>

      {/* Tips */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold mb-3 text-ink-500">Consejos para mejores resultados</h2>
        <Accordion title="Recomendaciones rápidas" defaultOpen>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fondo blanco o neutro y luz uniforme.</li>
            <li>Modelos con 2–3 poses y expresiones diferentes.</li>
            <li>Ropa sin arrugas marcadas ni sombras duras.</li>
            <li>Sube imágenes de ≥ 1024px y bien recortadas.</li>
          </ul>
        </Accordion>
      </section>
    </main>
  )
}