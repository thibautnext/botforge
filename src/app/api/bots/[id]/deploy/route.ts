import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { postgrest } from '@/lib/db'
import { validateToken, setWebhook, deleteWebhook } from '@/lib/telegram'
import crypto from 'crypto'

// POST /api/bots/[id]/deploy - Deploy or undeploy bot
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const { action } = await req.json() // 'deploy' or 'undeploy'

  // Get bot
  let bot
  try {
    bot = await postgrest('botforge_bots', {
      query: `id=eq.${id}&user_id=eq.${user.sub}&select=*`,
      single: true,
    })
  } catch {
    return NextResponse.json({ error: 'Bot non trouvé' }, { status: 404 })
  }

  if (action === 'undeploy') {
    if (bot.telegram_token) {
      await deleteWebhook(bot.telegram_token)
    }
    await postgrest('botforge_bots', {
      method: 'PATCH',
      query: `id=eq.${id}&user_id=eq.${user.sub}`,
      body: { status: 'draft', updated_at: new Date().toISOString() },
    })
    return NextResponse.json({ ok: true, status: 'draft' })
  }

  // Deploy
  if (!bot.telegram_token) {
    return NextResponse.json({ error: 'Token Telegram requis' }, { status: 400 })
  }

  // Validate token
  const validation = await validateToken(bot.telegram_token)
  if (!validation.ok) {
    return NextResponse.json({ error: 'Token Telegram invalide' }, { status: 400 })
  }

  // Generate webhook secret
  const webhookSecret = crypto.randomBytes(32).toString('hex')

  // Determine the base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://botforge-lime.vercel.app'
  const webhookUrl = `${baseUrl}/api/webhooks/telegram/${id}`

  // Set webhook
  const result = await setWebhook(bot.telegram_token, webhookUrl, webhookSecret)
  if (!result.ok) {
    return NextResponse.json({ error: 'Erreur webhook Telegram', details: result }, { status: 500 })
  }

  // Update bot status
  await postgrest('botforge_bots', {
    method: 'PATCH',
    query: `id=eq.${id}&user_id=eq.${user.sub}`,
    body: {
      status: 'active',
      webhook_secret: webhookSecret,
      updated_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({
    ok: true,
    status: 'active',
    bot_username: validation.username,
  })
}
