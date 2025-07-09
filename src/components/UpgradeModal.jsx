import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  XMarkIcon, 
  StarIcon, 
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  reason = 'board_limit',
  currentPlan = 'free' 
}) {
  const getModalContent = () => {
    switch (reason) {
      case 'board_limit':
        return {
          title: 'Board Limit Reached (3/3)',
          description: 'You\'ve reached the maximum of 3 boards for your free plan. Upgrade to Pro for unlimited boards and advanced features.',
          icon: SparklesIcon,
          suggestedPlan: 'pro'
        }
      case 'member_limit':
        return {
          title: 'Member Limit Reached',
          description: 'You\'ve reached the maximum number of team members. Upgrade to add more collaborators.',
          icon: SparklesIcon,
          suggestedPlan: 'pro'
        }
      case 'storage_limit':
        return {
          title: 'Storage Limit Reached',
          description: 'You\'ve used all your available storage. Upgrade to get more space for your files.',
          icon: SparklesIcon,
          suggestedPlan: 'pro'
        }
      case 'feature_locked':
        return {
          title: 'Premium Feature',
          description: 'This feature is available in our Pro and Team plans. Upgrade to unlock advanced capabilities.',
          icon: StarIcon,
          suggestedPlan: 'pro'
        }
      default:
        return {
          title: 'Upgrade Your Plan',
          description: 'Unlock more features and capabilities with our premium plans.',
          icon: StarIcon,
          suggestedPlan: 'pro'
        }
    }
  }

  const content = getModalContent()
  const Icon = content.icon

  const plans = [
    {
      name: 'Pro',
      price: '₹299',
      period: 'per month',
      features: [
        'Unlimited boards',
        '25 team members',
        '100GB storage',
        'Premium templates',
        'Advanced analytics',
        'Priority support'
      ],
      popular: true,
      trial: true
    },
    {
      name: 'Team',
      price: '₹599',
      period: 'per month',
      features: [
        'Everything in Pro',
        '100 team members',
        '500GB storage',
        'Advanced permissions',
        'Custom integrations',
        'Phone support'
      ],
      popular: false,
      trial: true
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{content.title}</h2>
                    <p className="text-indigo-100 mt-1">{content.description}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Choose Your Upgrade
                  </h3>
                  <p className="text-gray-600">
                    Start with a 14-day free trial. No credit card required.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.name}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-6 rounded-xl border-2 ${
                        plan.popular 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                            <StarIcon className="h-3 w-3" />
                            <span>Recommended</span>
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h4>
                        <div className="mb-2">
                          <span className="text-3xl font-bold text-gray-900">
                            {plan.price}
                          </span>
                          <span className="text-gray-600 ml-1">/{plan.period}</span>
                        </div>
                        {plan.trial && (
                          <p className="text-indigo-600 text-sm font-medium">
                            14-day free trial
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to={`/subscribe/${plan.name.toLowerCase()}`}
                        onClick={onClose}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-center block ${
                          plan.popular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Start Free Trial
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-gray-500 text-sm mb-4">
                    All plans include our core features. Cancel anytime during trial.
                  </p>
                  <div className="flex justify-center space-x-6 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CheckIcon className="h-3 w-3 text-green-500" />
                      <span>No setup fees</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckIcon className="h-3 w-3 text-green-500" />
                      <span>Cancel anytime</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckIcon className="h-3 w-3 text-green-500" />
                      <span>Secure payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
