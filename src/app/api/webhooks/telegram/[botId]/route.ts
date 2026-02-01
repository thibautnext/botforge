import { NextRequest, NextResponse } from 'next/server'
import { postgrest } from '@/lib/db'
import { sendMessage } from '@/lib/telegram'

interface BotConfig {
  name?: string
  description?: string
  address?: string
  phone?: string
  openHours?: string
  specialties?: string
  services?: string
  [key: string]: string | undefined
}

function buildResponse(template: string, config: BotConfig, userMessage: string): string {
  const msg = userMessage.toLowerCase().trim()
  const name = config.name || 'notre commerce'

  // /start command
  if (msg === '/start') {
    return `👋 Bonjour ! Bienvenue chez <b>${name}</b> !\n\n${config.description || ''}\n\nJe peux vous aider avec :\n• 📋 Nos informations → tapez <b>info</b>\n• 📍 Notre adresse → tapez <b>adresse</b>\n• 📞 Nous contacter → tapez <b>contact</b>\n• ⏰ Nos horaires → tapez <b>horaires</b>${template === 'restaurant' ? '\n• 🍽️ Notre carte → tapez <b>menu</b>' : ''}${template === 'salon' || template === 'artisan' ? '\n• 💼 Nos services → tapez <b>services</b>' : ''}`
  }

  // Info
  if (msg === 'info' || msg.includes('information')) {
    let text = `ℹ️ <b>${name}</b>\n\n`
    if (config.description) text += `${config.description}\n\n`
    if (config.address) text += `📍 ${config.address}\n`
    if (config.phone) text += `📞 ${config.phone}\n`
    if (config.openHours) text += `⏰ ${config.openHours}\n`
    return text
  }

  // Address
  if (msg === 'adresse' || msg.includes('adresse') || msg.includes('où')) {
    return `📍 <b>${name}</b>\n${config.address || 'Adresse non renseignée'}`
  }

  // Contact
  if (msg === 'contact' || msg.includes('téléphone') || msg.includes('appeler') || msg.includes('contacter')) {
    return `📞 Contactez <b>${name}</b>\n${config.phone || 'Téléphone non renseigné'}`
  }

  // Hours
  if (msg === 'horaires' || msg.includes('horaire') || msg.includes('ouvert') || msg.includes('heure')) {
    return `⏰ Horaires de <b>${name}</b>\n${config.openHours || 'Horaires non renseignés'}`
  }

  // Restaurant-specific
  if (template === 'restaurant') {
    if (msg === 'menu' || msg.includes('carte') || msg.includes('menu') || msg.includes('manger')) {
      return `🍽️ Nos spécialités chez <b>${name}</b>\n\n${config.specialties || 'Carte non renseignée'}\n\nPour réserver une table, tapez <b>réserver</b>`
    }
    if (msg.includes('réserv')) {
      return `📅 Pour réserver une table chez <b>${name}</b>, contactez-nous :\n📞 ${config.phone || 'Non renseigné'}\n\nOu passez directement à :\n📍 ${config.address || 'Non renseigné'}`
    }
  }

  // Salon / Artisan services
  if (template === 'salon' || template === 'artisan') {
    if (msg === 'services' || msg.includes('service') || msg.includes('prestation')) {
      return `💼 Services de <b>${name}</b>\n\n${config.services || 'Services non renseignés'}\n\nPour prendre rendez-vous, tapez <b>rdv</b>`
    }
    if (msg.includes('rdv') || msg.includes('rendez-vous') || msg.includes('réserv')) {
      return `📅 Pour prendre rendez-vous chez <b>${name}</b>, contactez-nous :\n📞 ${config.phone || 'Non renseigné'}`
    }
  }

  // Greetings
  if (msg === 'bonjour' || msg === 'salut' || msg === 'hello' || msg === 'hi' || msg === 'coucou') {
    return `👋 Bonjour ! Comment puis-je vous aider ?\n\nTapez <b>info</b> pour en savoir plus sur ${name}.`
  }

  // Thanks
  if (msg.includes('merci')) {
    return `🙏 Avec plaisir ! N'hésitez pas si vous avez d'autres questions.\n\nÀ bientôt chez <b>${name}</b> !`
  }

  // Default
  return `🤖 Je ne suis pas sûr de comprendre votre demande.\n\nVoici ce que je peux faire :\n• <b>info</b> - Nos informations\n• <b>adresse</b> - Notre adresse\n• <b>contact</b> - Nous contacter\n• <b>horaires</b> - Nos horaires${template === 'restaurant' ? '\n• <b>menu</b> - Notre carte' : ''}${template === 'salon' || template === 'artisan' ? '\n• <b>services</b> - Nos services' : ''}`
}

// POST /api/webhooks/telegram/[botId] - Receive Telegram updates
export async function POST(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params

  try {
    // Get bot from DB
    let bot
    try {
      bot = await postgrest('botforge_bots', {
        query: `id=eq.${botId}&status=eq.active&select=*`,
        single: true,
      })
    } catch {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    // Verify webhook secret
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token')
    if (bot.webhook_secret && secretHeader !== bot.webhook_secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const update = await req.json()

    // Handle message
    if (update.message?.text) {
      const chatId = update.message.chat.id
      const userMessage = update.message.text
      const config = (bot.config || {}) as BotConfig
      const response = buildResponse(bot.template, config, userMessage)

      await sendMessage(bot.telegram_token, chatId, response)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
