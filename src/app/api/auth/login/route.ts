import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, signJWT } from '@/lib/auth'
import { postgrest } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const users = await postgrest('botforge_users', {
      query: `email=eq.${encodeURIComponent(email)}&select=id,email,name,password_hash,is_pro`,
    })

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const user = users[0]
    const valid = await comparePassword(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const token = signJWT({ sub: user.id, email: user.email, name: user.name })

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, is_pro: user.is_pro || false },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Login error:', msg)
    return NextResponse.json({ error: 'Erreur serveur', details: msg }, { status: 500 })
  }
}
