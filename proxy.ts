import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export default async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * - manifest.json, icons, assets, sw.js
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|icons|assets|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
