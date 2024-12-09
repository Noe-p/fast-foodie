import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware exécuté pour:', request.url);
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clé API manquante' },
      { status: 401 }
    )
  }
  
  if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json(
      { error: 'Clé API invalide' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

// Appliquer le middleware uniquement aux routes API
export const config = {
  matcher: [
    '/api/:path*',
    '/api/auth/:path*'
  ]
} 