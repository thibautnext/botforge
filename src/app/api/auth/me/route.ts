import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { postgrest } from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Fetch fresh user data from DB (for is_pro status)
  try {
    const dbUser = await postgrest('botforge_users', {
      query: `id=eq.${user.sub}&select=id,email,name,is_pro`,
      single: true,
    })
    return NextResponse.json(dbUser)
  } catch {
    // Fallback to JWT data
    return NextResponse.json({
      id: user.sub,
      email: user.email,
      name: user.name,
      is_pro: false,
    })
  }
}
