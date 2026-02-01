const TG_API = 'https://api.telegram.org'

export async function tgRequest(token: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function validateToken(token: string): Promise<{ ok: boolean; username?: string }> {
  const res = await tgRequest(token, 'getMe')
  if (res.ok) {
    return { ok: true, username: res.result.username }
  }
  return { ok: false }
}

export async function setWebhook(token: string, url: string, secret: string) {
  return tgRequest(token, 'setWebhook', {
    url,
    secret_token: secret,
    allowed_updates: ['message'],
  })
}

export async function deleteWebhook(token: string) {
  return tgRequest(token, 'deleteWebhook')
}

export async function sendMessage(token: string, chatId: number, text: string) {
  return tgRequest(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  })
}
