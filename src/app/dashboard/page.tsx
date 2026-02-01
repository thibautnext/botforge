'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  CogIcon,
  ChartBarIcon,
  PowerIcon 
} from '@heroicons/react/24/outline'

interface Bot {
  id: number
  name: string
  template: string
  platform: string
  active: boolean
  created_at: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      // Simuler le chargement des bots pour le MVP
      setTimeout(() => {
        setBots([
          {
            id: 1,
            name: 'Restaurant La Bonne Table',
            template: 'restaurant',
            platform: 'whatsapp',
            active: true,
            created_at: '2024-01-15T10:30:00Z'
          }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [status, router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'restaurant':
        return '🍽️'
      case 'salon':
        return '✂️'
      case 'artisan':
        return '🔧'
      default:
        return '🤖'
    }
  }

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case 'restaurant':
        return 'Restaurant'
      case 'salon':
        return 'Salon de coiffure'
      case 'artisan':
        return 'Artisan'
      default:
        return 'Personnalisé'
    }
  }

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'telegram':
        return 'Telegram'
      default:
        return platform
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">BotForge</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                {session?.user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white p-2 rounded-md transition-colors"
              >
                <PowerIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bonjour, {session?.user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-gray-400">
            Gérez vos chatbots et analysez leurs performances depuis ce tableau de bord.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Chatbots actifs</p>
                <p className="text-2xl font-bold text-white">{bots.filter(bot => bot.active).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Conversations ce mois</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Taux de résolution</p>
                <p className="text-2xl font-bold text-white">94%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bots Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Mes chatbots</h2>
              <Link
                href="/dashboard/bots/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un bot
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {bots.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aucun chatbot pour le moment
                </h3>
                <p className="text-gray-400 mb-6">
                  Créez votre premier chatbot en quelques minutes avec nos templates prêts à l&apos;emploi.
                </p>
                <Link
                  href="/dashboard/bots/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Créer mon premier bot
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{getTemplateIcon(bot.template)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{getTemplateLabel(bot.template)}</span>
                            <span>•</span>
                            <span>{getPlatformLabel(bot.platform)}</span>
                            <span>•</span>
                            <span className={bot.active ? 'text-green-400' : 'text-red-400'}>
                              {bot.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/bots/${bot.id}/edit`}
                          className="text-gray-400 hover:text-white p-2 rounded-md transition-colors"
                        >
                          <CogIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}