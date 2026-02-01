'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  CogIcon,
  PowerIcon,
  TrashIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

interface Bot {
  id: string
  name: string
  template: string
  config: Record<string, string>
  telegram_token: string | null
  status: string
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const { user, loading: authLoading, logout, authFetch } = useAuth()
  const router = useRouter()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) {
      loadBots()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const loadBots = async () => {
    try {
      const res = await authFetch('/api/bots')
      if (res.ok) {
        const data = await res.json()
        setBots(data)
      }
    } catch (err) {
      console.error('Failed to load bots:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async (botId: string, currentStatus: string) => {
    setDeploying(botId)
    try {
      const action = currentStatus === 'active' ? 'undeploy' : 'deploy'
      const res = await authFetch(`/api/bots/${botId}/deploy`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await loadBots()
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur de déploiement')
      }
    } catch (err) {
      console.error('Deploy error:', err)
    } finally {
      setDeploying(null)
    }
  }

  const handleDelete = async (botId: string) => {
    if (!confirm('Supprimer ce bot ?')) return
    try {
      await authFetch(`/api/bots/${botId}`, { method: 'DELETE' })
      setBots(bots.filter((b) => b.id !== botId))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const getTemplateIcon = (t: string) => ({ restaurant: '🍽️', salon: '✂️', artisan: '🔧' }[t] || '🤖')
  const getTemplateLabel = (t: string) => ({ restaurant: 'Restaurant', salon: 'Salon de coiffure', artisan: 'Artisan' }[t] || t)

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
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
              <div className="text-sm text-gray-300">{user?.email}</div>
              <button
                onClick={() => { logout(); router.push('/') }}
                className="text-gray-400 hover:text-white p-2 rounded-md transition-colors"
              >
                <PowerIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bonjour, {user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-gray-400">Gérez vos chatbots Telegram</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total bots</p>
                <p className="text-2xl font-bold text-white">{bots.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Bots actifs</p>
                <p className="text-2xl font-bold text-white">{bots.filter(b => b.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Brouillons</p>
                <p className="text-2xl font-bold text-white">{bots.filter(b => b.status === 'draft').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bots list */}
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
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun chatbot</h3>
                <p className="text-gray-400 mb-6">Créez votre premier chatbot en quelques minutes !</p>
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
                            <span>Telegram</span>
                            <span>•</span>
                            <span className={bot.status === 'active' ? 'text-green-400' : 'text-yellow-400'}>
                              {bot.status === 'active' ? '🟢 Actif' : '⚪ Brouillon'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeploy(bot.id, bot.status)}
                          disabled={deploying === bot.id || !bot.telegram_token}
                          title={!bot.telegram_token ? 'Token Telegram requis' : bot.status === 'active' ? 'Désactiver' : 'Déployer'}
                          className={`p-2 rounded-md transition-colors ${
                            bot.status === 'active'
                              ? 'text-green-400 hover:text-red-400 hover:bg-gray-700'
                              : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                          } disabled:opacity-30`}
                        >
                          {deploying === bot.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                          ) : (
                            <RocketLaunchIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(bot.id)}
                          className="text-gray-400 hover:text-red-400 p-2 rounded-md transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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
