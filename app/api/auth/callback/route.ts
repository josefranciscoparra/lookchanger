import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  const { event, session } = await request.json()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (event === 'SIGNED_OUT') {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } else if (session) {
    const { error } = await supabase.auth.setSession(session)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  }

  return response
}
