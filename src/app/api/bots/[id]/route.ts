import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { postgrest } from '@/lib/db'

// GET /api/bots/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  try {
    const bot = await postgrest('botforge_bots', {
      query: `id=eq.${id}&user_id=eq.${user.sub}&select=*`,
      single: true,
    })
    return NextResponse.json(bot)
  } catch {
    return NextResponse.json({ error: 'Bot non trouvé' }, { status: 404 })
  }
}

// PATCH /api/bots/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const allowed = ['name', 'config', 'telegram_token', 'status']
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  try {
    const [bot] = await postgrest('botforge_bots', {
      method: 'PATCH',
      query: `id=eq.${id}&user_id=eq.${user.sub}`,
      body: update,
    })
    return NextResponse.json(bot)
  } catch (error: unknown) {
    console.error('Update bot error:', error)
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }
}

// DELETE /api/bots/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await postgrest('botforge_bots', {
    method: 'DELETE',
    query: `id=eq.${id}&user_id=eq.${user.sub}`,
  })

  return NextResponse.json({ ok: true })
}
