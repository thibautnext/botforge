'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface Template {
  id: string
  title: string
  description: string
  icon: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'textarea' | 'time' | 'select'
    placeholder?: string
    options?: string[]
    required: boolean
  }>
  demoMessages: Array<{
    user: boolean
    message: string
  }>
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
      { key: 'openHours', label: 'Horaires', type: 'text', placeholder: 'Lun-Sam 12h-22h, Dim fermé', required: true },
      { key: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Coq au vin, Bouillabaisse...', required: false }
    ],
    demoMessages: [
      { user: true, message: 'Bonjour, je voudrais réserver une table' },
      { user: false, message: '👋 Bonjour ! Je peux vous aider à réserver une table à La Bonne Table.\n\nPour combien de personnes et à quelle date ?' },
      { user: true, message: 'Pour 4 personnes ce samedi soir' },
      { user: false, message: '✅ Parfait ! Ce samedi nous avons des créneaux disponibles :\n• 19h00\n• 20h30\n• 21h15\n\nQuel créneau vous convient ?' }
    ]
  },
  {
    id: 'salon',
    title: 'Salon de coiffure',
    description: 'Automatisez les prises de rendez-vous de votre salon',
    icon: '✂️',
    fields: [
      { key: 'name', label: 'Nom du salon', type: 'text', placeholder: 'Coiffure Élégance', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Salon de coiffure moderne...', required: true },
      { key: 'address', label: 'Adresse', type: 'text', placeholder: '456 Avenue des Styles, Lyon', required: true },
      { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '04 12 34 56 78', required: true },
      { key: 'openHours', label: 'Horaires', type: 'text', placeholder: 'Mar-Sam 9h-18h, Lun fermé', required: true },
      { key: 'services', label: 'Services', type: 'textarea', placeholder: 'Coupe, Coloration, Brushing...', required: true }
    ],
    demoMessages: [
      { user: true, message: 'Salut ! Je veux prendre rdv' },
      { user: false, message: '💇‍♀️ Bonjour ! Je serais ravie de vous accueillir chez Coiffure Élégance.\n\nQuel service vous intéresse ?\n• Coupe\n• Coloration\n• Brushing\n• Autre' },
      { user: true, message: 'Une coupe svp' },
      { user: false, message: '✂️ Parfait pour une coupe !\n\nJe peux vous proposer ces créneaux cette semaine :\n• Mercredi 14h\n• Jeudi 16h30\n• Vendredi 10h\n\nQue préférez-vous ?' }
    ]
  },
  {
    id: 'artisan',
    title: 'Artisan',
    description: 'Gérez vos devis et interventions en automatique',
    icon: '🔧',
    fields: [
      { key: 'name', label: 'Nom de l\'entreprise', type: 'text', placeholder: 'Plomberie Expert', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Plombier professionnel...', required: true },
      { key: 'address', label: 'Zone d\'intervention', type: 'text', placeholder: 'Toulouse et périphérie', required: true },
      { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '05 12 34 56 78', required: true },
      { key: 'openHours', label: 'Disponibilités', type: 'text', placeholder: 'Lun-Ven 8h-17h, urgences 24h/24', required: true },
      { key: 'services', label: 'Services', type: 'textarea', placeholder: 'Dépannage, Installation, Rénovation...', required: true }
    ],
    demoMessages: [
      { user: true, message: 'Bonjour, j\'ai une fuite d\'eau' },
      { user: false, message: '🚰 Bonjour ! Je comprends votre urgence avec cette fuite.\n\nPlomberie Expert peut intervenir rapidement.\n\nPouvez-vous me dire :\n• Où se situe la fuite ?\n• Depuis quand ?\n• Avez-vous coupé l\'eau ?' },
      { user: true, message: 'C\'est dans la cuisine, depuis ce matin. J\'ai fermé le robinet' },
      { user: false, message: '✅ Très bien ! Je peux vous envoyer un technicien :\n• Aujourd\'hui en urgence (+ 50€)\n• Demain matin créneau normal\n\nQue préférez-vous ?' }
    ]
  }
]

export default function NewBot() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setStep(2)
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Simuler la sauvegarde en DB
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Rediriger vers le dashboard
    router.push('/dashboard')
  }

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white mr-4">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Retour
              </Link>
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">Créer un chatbot</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            } text-sm font-medium`}>
              {step > 1 ? <CheckIcon className="h-5 w-5" /> : '1'}
            </div>
            <div className={`flex-1 h-1 mx-4 ${step > 1 ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            } text-sm font-medium`}>
              {step > 2 ? <CheckIcon className="h-5 w-5" /> : '2'}
            </div>
            <div className={`flex-1 h-1 mx-4 ${step > 2 ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
            } text-sm font-medium`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Template</span>
            <span>Configuration</span>
            <span>Aperçu</span>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choisissez votre template</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="text-4xl mb-4 text-center">{template.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 text-center">{template.title}</h3>
                  <p className="text-gray-300 text-center">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && currentTemplate && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Configuration - {currentTemplate.title}
              </h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="space-y-6">
                  {currentTemplate.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-white mb-2">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Sélectionnez...</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors flex-1"
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Aperçu temps réel</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-96 flex flex-col">
                <div className="flex items-center mb-4 pb-2 border-b border-gray-600">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    {currentTemplate.icon}
                  </div>
                  <div className="ml-3">
                    <div className="text-white font-medium">
                      {formData.name || currentTemplate.title}
                    </div>
                    <div className="text-xs text-green-400">En ligne</div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                  {currentTemplate.demoMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.user
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {msg.message.replace('La Bonne Table', formData.name || 'Votre Commerce')}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-2 border-t border-gray-600">
                  <div className="bg-gray-700 rounded-full px-4 py-2 text-gray-400 text-sm">
                    Tapez votre message...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Final Preview */}
        {step === 3 && currentTemplate && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Votre chatbot est prêt !</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Récapitulatif</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{currentTemplate.icon}</span>
                    <div>
                      <div className="text-white font-medium">{formData.name || 'Mon Commerce'}</div>
                      <div className="text-gray-400 text-sm">{currentTemplate.title}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plateforme</span>
                      <span className="text-white">Telegram (WhatsApp bientôt)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statut</span>
                      <span className="text-green-400">Prêt à déployer</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md transition-colors"
                  >
                    Modifier la configuration
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Créer le chatbot
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Simulation de conversation</h3>
                <div className="h-96 flex flex-col">
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-600">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      {currentTemplate.icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-medium">
                        {formData.name || 'Mon Commerce'}
                      </div>
                      <div className="text-xs text-green-400">En ligne</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {currentTemplate.demoMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.user
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {msg.message
                            .replace('La Bonne Table', formData.name || 'Mon Commerce')
                            .replace('Coiffure Élégance', formData.name || 'Mon Commerce')
                            .replace('Plomberie Expert', formData.name || 'Mon Commerce')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}