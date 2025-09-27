export const metadata = { 
  title: 'LookChanger - Autenticación', 
  description: 'Accede a tu cuenta de LookChanger' 
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}