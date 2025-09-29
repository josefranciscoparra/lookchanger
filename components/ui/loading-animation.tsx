'use client'
import { useEffect, useState } from 'react'

const MESSAGES = [
  'Estamos generando tu imagen...',
  'Prepárate para algo bueno',
  'Creando magia con IA',
  'Tu outfit está tomando forma',
  'Ajustando los detalles perfectos',
  'Casi listo, un momento más',
  'La IA está trabajando para ti'
]

export function LoadingAnimation() {
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-16 min-h-[400px]">
      {/* Nube de polvo rosa que se desvanece */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Partículas de polvo múltiples con diferentes tamaños y desvanecimientos */}
        <div className="absolute h-32 w-32 rounded-full bg-pink-300/30 blur-2xl animate-fade-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute h-40 w-40 rounded-full bg-rose-300/25 blur-3xl animate-fade-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute h-48 w-48 rounded-full bg-pink-200/20 blur-3xl animate-fade-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute h-36 w-36 rounded-full bg-rose-200/30 blur-2xl animate-fade-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute h-44 w-44 rounded-full bg-pink-300/20 blur-3xl animate-fade-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute h-52 w-52 rounded-full bg-rose-300/15 blur-3xl animate-fade-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Mensajes rotativos con desvanecimiento */}
      <div className="relative z-10 h-20 flex items-center justify-center px-6">
        {MESSAGES.map((message, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-700 ease-in-out ${
              index === currentMessage
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <p className="text-xl sm:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-center whitespace-nowrap">
              {message}
            </p>
          </div>
        ))}
      </div>

      {/* Estilos de animación personalizados */}
      <style jsx>{`
        @keyframes fade-pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-fade-pulse {
          animation: fade-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}