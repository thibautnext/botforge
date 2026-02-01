import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { postgrest } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('✅ Checkout completed:', session.id)

      const email = session.customer_email
      if (email) {
        try {
          await postgrest('botforge_users', {
            method: 'PATCH',
            query: `email=eq.${encodeURIComponent(email)}`,
            body: {
              is_pro: true,
              stripe_customer_id: (session.customer as string) || null,
              stripe_subscription_id: (session.subscription as string) || null,
            },
          })
          console.log(`✅ User ${email} upgraded to Pro`)
        } catch (err) {
          console.error('Failed to update user:', err)
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log('❌ Subscription cancelled:', subscription.id)

      try {
        await postgrest('botforge_users', {
          method: 'PATCH',
          query: `stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}`,
          body: {
            is_pro: false,
          },
        })
        console.log(`❌ Subscription ${subscription.id} cancelled in DB`)
      } catch (err) {
        console.error('Failed to downgrade user:', err)
      }
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
