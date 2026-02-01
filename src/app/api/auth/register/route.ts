import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, signJWT } from '@/lib/auth'
import { postgrest } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères' }, { status: 400 })
    }

    // Check if user exists
    const existing = await postgrest('botforge_users', {
      query: `email=eq.${encodeURIComponent(email)}&select=id`,
    })

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const password_hash = await hashPassword(password)

    const [user] = await postgrest('botforge_users', {
      method: 'POST',
      body: { email, name: name || email.split('@')[0], password_hash },
    })

    const token = signJWT({ sub: user.id, email: user.email, name: user.name })

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, is_pro: false },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Register error:', msg)
    return NextResponse.json({ error: 'Erreur serveur', details: msg }, { status: 500 })
  }
}
