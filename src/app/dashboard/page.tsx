'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  CogIcon,
  PowerIcon,
  TrashIcon,
  RocketLaunchIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const FREE_BOT_LIMIT = 1

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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}

function Dashboard() {
  const { user, loading: authLoading, logout, authFetch } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }
    if (user) loadBots()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowSuccess(true)
      window.history.replaceState({}, '', '/dashboard')
    }
    if (searchParams.get('upgrade') === 'true') {
      setShowUpgrade(true)
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const loadBots = async () => {
    try {
      const res = await authFetch('/api/bots')
      if (res.ok) setBots(await res.json())
    } catch (err) {
      console.error('Failed to load bots:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewBot = () => {
    if (!user?.is_pro && bots.length >= FREE_BOT_LIMIT) {
      setShowUpgrade(true)
      return
    }
    router.push('/dashboard/bots/new')
  }

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    try {
      const res = await authFetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Erreur')
    } catch {
      alert('Erreur de paiement')
    } finally {
      setCheckoutLoading(false)
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
      if (res.ok) await loadBots()
      else {
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
  const getTemplateLabel = (t: string) => ({ restaurant: 'Restaurant', salon: 'Salon', artisan: 'Artisan' }[t] || t)

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
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
              {user?.is_pro && (
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  PRO
                </span>
              )}
              {!user?.is_pro && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center transition-colors"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Passer Pro
                </button>
              )}
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
        {/* Success banner */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <p className="text-white font-semibold">Bienvenue dans BotForge Pro ! 🎉</p>
                <p className="text-green-300 text-sm">Vous avez maintenant accès à tous les bots et templates.</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-gray-400 hover:text-white">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bonjour, {user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-gray-400">
            {user?.is_pro
              ? 'Gérez vos chatbots Telegram — bots illimités'
              : `Gérez vos chatbots Telegram — ${bots.length}/${FREE_BOT_LIMIT} bot${FREE_BOT_LIMIT > 1 ? 's' : ''} gratuit${FREE_BOT_LIMIT > 1 ? 's' : ''}`}
          </p>
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
                <p className="text-gray-400 text-sm">Plan</p>
                <p className="text-2xl font-bold text-white">{user?.is_pro ? '⭐ Pro' : 'Free'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bots list */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Mes chatbots</h2>
              <button
                onClick={handleNewBot}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un bot
              </button>
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
                <button
                  onClick={handleNewBot}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Créer mon premier bot
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {bots.map((bot) => (
                  <div key={bot.id} className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{getTemplateIcon(bot.template)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
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

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowUpgrade(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Passez à BotForge Pro</h3>
              <p className="text-gray-400">
                Vous avez atteint la limite de {FREE_BOT_LIMIT} bot gratuit. Passez Pro pour débloquer tout le potentiel.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'Chatbots illimités',
                'Tous les templates métier',
                'Personnalisation avancée',
                'Support prioritaire',
                'Analytics détaillées',
              ].map((feature) => (
                <div key={feature} className="flex items-center text-white">
                  <svg className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-white">$9.99</span>
              <span className="text-gray-400 ml-1">/ mois</span>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {checkoutLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Passer Pro — $9.99/mois
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Paiement sécurisé par Stripe. Annulable à tout moment.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
