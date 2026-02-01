import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { postgrest } from '@/lib/db'

// GET /api/bots - List user's bots
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const bots = await postgrest('botforge_bots', {
    query: `user_id=eq.${user.sub}&select=id,name,template,config,telegram_token,status,created_at,updated_at&order=created_at.desc`,
  })

  return NextResponse.json(bots)
}

// POST /api/bots - Create a bot
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { name, template, config, telegram_token } = await req.json()

    if (!name || !template) {
      return NextResponse.json({ error: 'Nom et template requis' }, { status: 400 })
    }

    // Check bot limit for free users
    const dbUser = await postgrest('botforge_users', {
      query: `id=eq.${user.sub}&select=is_pro`,
      single: true,
    }).catch(() => ({ is_pro: false }))

    if (!dbUser.is_pro) {
      const existingBots = await postgrest('botforge_bots', {
        query: `user_id=eq.${user.sub}&select=id`,
      })
      if (existingBots && existingBots.length >= 1) {
        return NextResponse.json(
          { error: 'UPGRADE_REQUIRED', message: 'Les utilisateurs gratuits sont limités à 1 bot. Passez en Pro pour en créer plus !' },
          { status: 403 }
        )
      }
    }

    const [bot] = await postgrest('botforge_bots', {
      method: 'POST',
      body: {
        user_id: user.sub,
        name,
        template,
        config: config || {},
        telegram_token: telegram_token || null,
        status: 'draft',
      },
    })

    return NextResponse.json(bot, { status: 201 })
  } catch (error: unknown) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
