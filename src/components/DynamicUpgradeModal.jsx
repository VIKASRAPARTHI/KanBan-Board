import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../contexts/SubscriptionContext'
import { 
  XMarkIcon, 
  CheckIcon, 
  StarIcon,
  CreditCardIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const planDetails = {
  pro: {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    description: 'Perfect for professionals and small teams',
    features: [
      '50 boards',
      '25 team members',
      'Premium templates',
      '100GB storage',
      'Priority support',
      'Time tracking',
      'Custom fields',
      'Priority levels',
      'Advanced analytics'
    ],
    color: 'indigo',
    icon: StarIcon
  },
  team: {
    name: 'Team',
    price: '₹599',
    period: '/month',
    description: 'Advanced features for growing teams',
    features: [
      '200 boards',
      '100 team members',
      'All Pro features',
      '500GB storage',
      'Phone support',
      'Team analytics',
      'Advanced permissions',
      'Custom integrations',
      'Automation features',
      'Calendar view'
    ],
    color: 'purple',
    icon: CreditCardIcon
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited boards',
      'Unlimited members',
      'Unlimited storage',
      'Dedicated support',
      'Custom development',
      'On-premise deployment',
      'Advanced security',
      'SLA guarantee',
      'API access',
      'White-label options'
    ],
    color: 'gray',
    icon: ShieldCheckIcon
  }
}

export default function DynamicUpgradeModal({ isOpen, onClose, reason = '' }) {
  const { subscription } = useSubscription()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)

  const getAvailablePlans = () => {
    const currentPlan = subscription?.plan || 'free'
    
    switch (currentPlan) {
      case 'free':
        return ['pro', 'team', 'enterprise']
      case 'pro':
        return ['team', 'enterprise']
      case 'team':
        return ['enterprise']
      default:
        return []
    }
  }

  const availablePlans = getAvailablePlans()

  const handlePlanSelect = (planKey) => {
    if (planKey === 'enterprise') {
      // For enterprise, show contact form or redirect to contact
      window.open('mailto:sales@taskflowpro.com?subject=Enterprise Plan Inquiry', '_blank')
      onClose()
    } else {
      navigate(`/subscribe/${planKey}`)
      onClose()
    }
  }

  const getReasonMessage = () => {
    switch (reason) {
      case 'board_limit':
        return 'You\'ve reached your board limit. Upgrade to create more boards!'
      case 'member_limit':
        return 'You\'ve reached your team member limit. Upgrade to add more members!'
      case 'storage_limit':
        return 'You\'ve reached your storage limit. Upgrade for more space!'
      case 'feature_locked':
        return 'This feature is available in higher plans. Upgrade to unlock it!'
      default:
        return 'Upgrade your plan to unlock more features and capabilities!'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
                <p className="text-gray-600 mt-1">{getReasonMessage()}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {availablePlans.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  You're on the highest plan!
                </h3>
                <p className="text-gray-600">
                  You already have access to all our premium features.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                availablePlans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                availablePlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {availablePlans.map((planKey) => {
                  const plan = planDetails[planKey]
                  const Icon = plan.icon
                  
                  return (
                    <motion.div
                      key={planKey}
                      whileHover={{ scale: 1.02 }}
                      className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedPlan === planKey
                          ? `border-${plan.color}-500 bg-${plan.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(planKey)}
                    >
                      {planKey === 'team' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <Icon className={`h-12 w-12 text-${plan.color}-600 mx-auto mb-4`} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600">{plan.period}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                        
                        <ul className="space-y-2 mb-6">
                          {plan.features.slice(0, 6).map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 6 && (
                            <li className="text-sm text-gray-500">
                              +{plan.features.length - 6} more features
                            </li>
                          )}
                        </ul>
                        
                        <button
                          onClick={() => handlePlanSelect(planKey)}
                          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                            planKey === 'enterprise'
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : `bg-${plan.color}-600 text-white hover:bg-${plan.color}-700`
                          }`}
                        >
                          {planKey === 'enterprise' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
