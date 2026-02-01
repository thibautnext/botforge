import Link from 'next/link'
import { ChevronRightIcon, CheckIcon, ChatBubbleLeftRightIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const templates = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Réservations automatiques, menu du jour, commandes à emporter',
    icon: '🍽️',
    features: ['Gestion des réservations', 'Menu interactif', 'Commandes en ligne']
  },
  {
    id: 'salon',
    title: 'Salon de coiffure',
    description: 'Prise de rendez-vous, rappels automatiques, présentation services',
    icon: '✂️',
    features: ['Réservation en ligne', 'Rappels SMS/WhatsApp', 'Galerie de coiffures']
  },
  {
    id: 'artisan',
    title: 'Artisan',
    description: 'Demandes de devis, portfolio de réalisations, planning',
    icon: '🔧',
    features: ['Devis automatisés', 'Portfolio interactif', 'Planification interventions']
  }
]

const plans = [
  {
    name: 'Free',
    price: '0€',
    period: 'à vie',
    features: [
      '1 chatbot',
      'Templates de base',
      'Conversations illimitées',
      'Support par email'
    ],
    cta: 'Commencer gratuitement',
    featured: false
  },
  {
    name: 'Pro',
    price: '15€',
    period: 'par mois',
    features: [
      '5 chatbots',
      'Tous les templates',
      'Personnalisation avancée',
      'Intégrations webhook',
      'Analytics détaillées',
      'Support prioritaire'
    ],
    cta: 'Essayer 14 jours gratuits',
    featured: true
  },
  {
    name: 'Business',
    price: '39€',
    period: 'par mois',
    features: [
      'Chatbots illimités',
      'Templates personnalisés',
      'API complète',
      'Marque blanche',
      'Support téléphonique',
      'Formation personnalisée'
    ],
    cta: 'Contactez-nous',
    featured: false
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">BotForge</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="#pricing"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Tarifs
              </Link>
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
            Créez votre chatbot en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              5 minutes
            </span>
            , sans coder
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Templates métier prêts à l&apos;emploi pour restaurants, salons de coiffure et artisans. 
            Automatisez vos réservations, commandes et relation client sur WhatsApp et Telegram.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center"
            >
              Commencer gratuitement
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <div className="text-gray-400 text-sm">
              ⚡ Aucune carte de crédit requise
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Templates métier prêts à l&apos;emploi
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choisissez le template qui correspond à votre activité et personnalisez-le en quelques clics.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-gray-700 rounded-xl p-8 hover:bg-gray-650 transition-colors border border-gray-600"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{template.title}</h3>
                <p className="text-gray-300 mb-6">{template.description}</p>
                <ul className="space-y-2">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pourquoi choisir BotForge ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Configuration rapide</h3>
              <p className="text-gray-300">
                Configurez votre chatbot en moins de 5 minutes avec nos templates prêts à l&apos;emploi.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-plateforme</h3>
              <p className="text-gray-300">
                Déployez sur WhatsApp et Telegram pour toucher vos clients où ils sont.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Support dédié</h3>
              <p className="text-gray-300">
                Notre équipe vous accompagne dans la création et l&apos;optimisation de vos chatbots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tarifs transparents
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Commencez gratuitement et évoluez selon vos besoins. Pas de frais cachés.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 ${
                  plan.featured
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 border-2 border-blue-500 relative'
                    : 'bg-gray-700 border border-gray-600'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Le plus populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-1">/ {plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-white">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/dashboard"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Prêt à automatiser votre relation client ?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Rejoignez les centaines de petits commerces qui font déjà confiance à BotForge.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            Créer mon premier chatbot
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                <span className="ml-2 text-lg font-bold text-white">BotForge</span>
              </div>
              <p className="text-gray-400">
                La plateforme no-code pour créer des chatbots métier en quelques minutes.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white">Fonctionnalités</Link></li>
                <li><Link href="/templates" className="text-gray-400 hover:text-white">Templates</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white">Tarifs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white">Statut</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Confidentialité</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">CGU</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BotForge. Tous droits réservés. Fait avec ❤️ en France.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}