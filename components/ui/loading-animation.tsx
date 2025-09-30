'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      {/* Nube de polvo rosa con animaciones de Framer Motion */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Partículas de polvo múltiples con diferentes tamaños y animaciones */}
        {[
          { size: 'h-32 w-32', delay: 0, opacity: 0.3 },
          { size: 'h-40 w-40', delay: 0.5, opacity: 0.25 },
          { size: 'h-48 w-48', delay: 1, opacity: 0.2 },
          { size: 'h-36 w-36', delay: 1.5, opacity: 0.3 },
          { size: 'h-44 w-44', delay: 2, opacity: 0.2 },
          { size: 'h-52 w-52', delay: 2.5, opacity: 0.15 }
        ].map((particle, index) => (
          <motion.div
            key={index}
            className={`absolute ${particle.size} rounded-full ${
              index % 2 === 0 ? 'bg-pink-300' : 'bg-rose-300'
            } blur-2xl`}
            initial={{ opacity: 0.2, scale: 0.95 }}
            animate={{
              opacity: [0.2, particle.opacity, 0.2],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Mensajes rotativos con animaciones suaves de Framer Motion */}
      <div className="relative z-10 h-20 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute"
          >
            <p className="text-xl sm:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-center whitespace-nowrap">
              {MESSAGES[currentMessage]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}