export const metadata = {
  title: 'Lookah - Autenticación',
  description: 'Accede a tu cuenta de Lookah'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}