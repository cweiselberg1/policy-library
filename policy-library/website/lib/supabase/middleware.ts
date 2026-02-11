import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired and check authentication
  const { data: { user } } = await supabase.auth.getUser()

  // Public paths that don't require authentication
  const publicPaths = ['/', '/blog', '/api/mixpanel']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/'))

  // If user is not authenticated and trying to access protected content, redirect to portal login
  if (!user && !isPublicPath) {
    const redirectUrl = new URL('https://portal.oneguyconsulting.com/auth/login')
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
