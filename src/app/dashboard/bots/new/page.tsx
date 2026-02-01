'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'

interface Template {
  id: string
  title: string
  description: string
  icon: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'textarea'
    placeholder?: string
    required: boolean
  }>
  demoMessages: Array<{ user: boolean; message: string }>
}

const templates: Template[] = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Gérez les réservations et commandes de votre restaurant',
    icon: '🍽️',
    fields: [
      { key: 'name', label: 'Nom du restaurant', type: 'text', placeholder: 'La Bonne Table', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Cuisine française traditionnelle...', required: true },
      { key: 'address', label: 'Adresse', type: 'text', placeholder: '123 Rue de la Paix, Paris', required: true },
      { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '01 23 45 67 89', required: true },
      { key: 'openHours', label: 'Horaires', type: 'text', placeholder: 'Lun-Sam 12h-22h', required: true },
      { key: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Coq au vin, Bouillabaisse...', required: false },
    ],
    demoMessages: [
      { user: true, message: 'Bonjour, je voudrais réserver une table' },
      { user: false, message: '👋 Bonjour ! Je peux vous aider à réserver une table.\n\nPour combien de personnes et à quelle date ?' },
      { user: true, message: 'Pour 4 personnes ce samedi soir' },
      { user: false, message: '✅ Parfait ! Nous avons des créneaux :\n• 19h00\n• 20h30\n• 21h15\n\nLequel vous convient ?' },
    ],
  },
  {
    id: 'salon',
    title: 'Salon de coiffure',
    description: 'Automatisez les prises de rendez-vous',
    icon: '✂️',
    fields: [
      { key: 'name', label: 'Nom du salon', type: 'text', placeholder: 'Coiffure Élégance', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Salon de coiffure moderne...', required: true },
      { key: 'address', label: 'Adresse', type: 'text', placeholder: '456 Avenue des Styles, Lyon', required: true },
      { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '04 12 34 56 78', required: true },
      { key: 'openHours', label: 'Horaires', type: 'text', placeholder: 'Mar-Sam 9h-18h', required: true },
      { key: 'services', label: 'Services', type: 'textarea', placeholder: 'Coupe, Coloration, Brushing...', required: true },
    ],
    demoMessages: [
      { user: true, message: 'Salut ! Je veux prendre rdv' },
      { user: false, message: '💇‍♀️ Bonjour ! Quel service vous intéresse ?\n• Coupe\n• Coloration\n• Brushing' },
      { user: true, message: 'Une coupe svp' },
      { user: false, message: '✂️ Parfait ! Créneaux disponibles :\n• Mercredi 14h\n• Jeudi 16h30\n• Vendredi 10h' },
    ],
  },
  {
    id: 'artisan',
    title: 'Artisan',
    description: 'Gérez vos devis et interventions',
    icon: '🔧',
    fields: [
      { key: 'name', label: "Nom de l'entreprise", type: 'text', placeholder: 'Plomberie Expert', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Plombier professionnel...', required: true },
      { key: 'address', label: "Zone d'intervention", type: 'text', placeholder: 'Toulouse et périphérie', required: true },
      { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '05 12 34 56 78', required: true },
      { key: 'openHours', label: 'Disponibilités', type: 'text', placeholder: 'Lun-Ven 8h-17h', required: true },
      { key: 'services', label: 'Services', type: 'textarea', placeholder: 'Dépannage, Installation, Rénovation...', required: true },
    ],
    demoMessages: [
      { user: true, message: "Bonjour, j'ai une fuite d'eau" },
      { user: false, message: '🚰 Bonjour ! Pouvez-vous me dire :\n• Où se situe la fuite ?\n• Depuis quand ?\n• Avez-vous coupé l\'eau ?' },
      { user: true, message: "Dans la cuisine, depuis ce matin" },
      { user: false, message: "✅ Je peux envoyer un technicien :\n• Aujourd'hui en urgence (+50€)\n• Demain matin créneau normal" },
    ],
  },
]

export default function NewBot() {
  const { user, loading: authLoading, authFetch } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [telegramToken, setTelegramToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin')
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  const currentTemplate = templates.find((t) => t.id === selectedTemplate)

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await authFetch('/api/bots', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name || currentTemplate?.title || 'Mon Bot',
          template: selectedTemplate,
          config: formData,
          telegram_token: telegramToken || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'UPGRADE_REQUIRED') {
          router.push('/dashboard?upgrade=true')
          return
        }
        throw new Error(data.message || data.error || 'Erreur de création')
      }

      const bot = await res.json()

      // Auto-deploy if token provided
      if (telegramToken) {
        const deployRes = await authFetch(`/api/bots/${bot.id}/deploy`, {
          method: 'POST',
          body: JSON.stringify({ action: 'deploy' }),
        })
        if (!deployRes.ok) {
          const data = await deployRes.json()
          console.warn('Deploy warning:', data.error)
        }
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white mr-4">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">Créer un chatbot</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {step > s ? <CheckIcon className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-600'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Template</span>
            <span>Configuration</span>
            <span>Déployer</span>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choisissez votre template</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => { setSelectedTemplate(t.id); setStep(2) }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="text-4xl mb-4 text-center">{t.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 text-center">{t.title}</h3>
                  <p className="text-gray-300 text-center">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && currentTemplate && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Configuration — {currentTemplate.title}</h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
                {currentTemplate.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-white mb-2">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}

                <div className="flex space-x-4 pt-4">
                  <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-300 hover:text-white">
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex-1"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Aperçu</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-96 flex flex-col">
                <div className="flex items-center mb-4 pb-2 border-b border-gray-600">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm">
                    {currentTemplate.icon}
                  </div>
                  <div className="ml-3">
                    <div className="text-white font-medium">{formData.name || currentTemplate.title}</div>
                    <div className="text-xs text-green-400">En ligne</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {currentTemplate.demoMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                        msg.user ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Token + Deploy */}
        {step === 3 && currentTemplate && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Connectez votre bot Telegram</h2>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Récapitulatif</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{currentTemplate.icon}</span>
                  <div>
                    <div className="text-white font-medium">{formData.name || currentTemplate.title}</div>
                    <div className="text-gray-400 text-sm">{currentTemplate.title}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Token Telegram <span className="text-gray-400">(optionnel — ajoutez-le plus tard)</span>
                </label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Obtenez-le via{' '}
                  <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    @BotFather
                  </a>{' '}
                  sur Telegram. Commande : /newbot
                </p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-300 hover:text-white">
                  Retour
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex-1 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Création...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-5 w-5 mr-2" />
                      {telegramToken ? 'Créer et déployer' : 'Créer le bot'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
