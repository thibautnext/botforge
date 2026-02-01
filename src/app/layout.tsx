import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BotForge - Créez votre chatbot en 5 minutes, sans coder',
  description: 'Templates métier prêts à l\'emploi pour restaurants, salons de coiffure et artisans. Automatisez vos réservations, commandes et relation client sur WhatsApp et Telegram.',
  keywords: 'chatbot, whatsapp, telegram, no-code, restaurant, salon, artisan, automatisation',
  authors: [{ name: 'BotForge' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
