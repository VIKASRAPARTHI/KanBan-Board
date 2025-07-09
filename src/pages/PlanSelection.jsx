import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  StarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import toast from 'react-hot-toast'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '3 Personal boards',
      '5 Team members',
      'Basic templates',
      '10MB file storage',
      'Email support'
    ],
    popular: false,
    cta: 'Start Free'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    description: 'Best for growing teams',
    features: [
      'Unlimited boards',
      '25 Team members',
      'Premium templates',
      '100GB file storage',
      'Priority support',
      'Advanced analytics',
      'Time tracking'
    ],
    popular: true,
    cta: 'Start 14-day Free Trial',
    trial: true
  },
  {
    id: 'team',
    name: 'Team',
    price: '₹599',
    period: 'per month',
    description: 'For larger teams',
    features: [
      'Everything in Pro',
      '100 Team members',
      'Advanced permissions',
      '500GB file storage',
      'Phone support',
      'Custom integrations',
      'Advanced automation'
    ],
    popular: false,
    cta: 'Start 14-day Free Trial',
    trial: true
  }
]

export default function PlanSelection() {
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const { createFreeSubscription, startTrial } = useSubscription()
  const navigate = useNavigate()

  const handlePlanSelect = async (plan) => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading(`Setting up your ${plan.name} plan...`)

    try {
      if (plan.id === 'free') {
        const success = await createFreeSubscription()
        if (success) {
          toast.success('Welcome to TaskFlow Pro!', { id: loadingToast })
          navigate('/dashboard')
        } else {
          toast.error('Failed to set up account', { id: loadingToast })
        }
      } else {
        // For paid plans, start trial or redirect to payment
        if (plan.trial) {
          const success = await startTrial(plan.id)
          if (success) {
            toast.success(`${plan.name} trial started!`, { id: loadingToast })
            navigate('/dashboard')
          } else {
            toast.error('Failed to start trial', { id: loadingToast })
          }
        } else {
          navigate(`/subscribe/${plan.id}`)
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
      toast.error('Error setting up plan', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <SparklesIcon className="h-8 w-8 text-indigo-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to TaskFlow Pro! Select the plan that best fits your needs. 
            You can always upgrade later.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border-2 ${
                plan.popular 
                  ? 'border-indigo-500 bg-white shadow-xl scale-105' 
                  : 'border-gray-200 bg-white shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="h-4 w-4" />
                    <span>Most Popular</span>
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
                {plan.trial && (
                  <p className="text-indigo-600 text-sm font-medium mt-2">
                    14-day free trial included
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanSelect(plan)}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>{loading ? 'Setting up...' : plan.cta}</span>
                {!loading && <ArrowRightIcon className="h-5 w-5" />}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm mb-4">
            All plans include our core Kanban features. Upgrade or downgrade anytime.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span>Secure payments</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
