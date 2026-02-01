import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserFromRequest } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://botforge-lime.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: {
        user_id: user.sub,
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Checkout error:', msg)
    return NextResponse.json(
      { error: 'Erreur checkout', details: msg },
      { status: 500 }
    )
  }
}
