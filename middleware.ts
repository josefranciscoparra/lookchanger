import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión siempre (importante para API routes)
  const { data: { user } } = await supabase.auth.getUser()

  // Para rutas API, solo refrescar sesión y continuar
  if (request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // Redirección automática de la página principal a login
  if (request.nextUrl.pathname === '/' && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Rutas que requieren autenticación
  const protectedPaths = ['/models', '/garments', '/outfits', '/gallery']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Redirigir a login si no está autenticado y trata de acceder a ruta protegida
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirigir a login si los registros están deshabilitados y trata de acceder a signup
  if (request.nextUrl.pathname === '/signup' && process.env.NEXT_PUBLIC_DISABLE_SIGNUP === 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('message', 'Los registros están temporalmente deshabilitados. Contacta con el administrador si necesitas acceso.')
    return NextResponse.redirect(url)
  }

  // Redirigir a home si está autenticado y trata de acceder a login/signup
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Includes API routes to ensure proper session handling
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}