'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const containerSizeClasses = {
    sm: 'min-h-[150px]',
    md: 'min-h-[250px]',
    lg: 'min-h-[350px]',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} gap-4`}>
      {/* Spinner circular con gradiente */}
      <div className="relative">
        {/* Círculo de fondo con efecto de pulso */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full bg-blush-400/20 absolute inset-0`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Spinner principal */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent bg-blush-400 bg-clip-border relative`}
          style={{
            maskImage: 'linear-gradient(transparent 50%, black 50%)',
            WebkitMaskImage: 'linear-gradient(transparent 50%, black 50%)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Punto brillante que rota */}
        <motion.div
          className="absolute top-0 left-1/2 w-2 h-2 bg-blush-500 rounded-full blur-sm"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ originX: 0.5, originY: size === 'sm' ? 4 : size === 'md' ? 6 : 8 }}
        />
      </div>

      {/* Texto opcional */}
      {text && (
        <motion.p
          className="text-sm text-muted-foreground text-center max-w-[250px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}