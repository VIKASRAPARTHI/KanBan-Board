import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  LockClosedIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export function UpgradePrompt({ 
  title, 
  description, 
  feature, 
  currentPlan = 'free',
  suggestedPlan = 'pro',
  className = '' 
}) {
  const planColors = {
    pro: 'from-indigo-500 to-purple-600',
    team: 'from-purple-500 to-pink-600',
    enterprise: 'from-gray-700 to-gray-900'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${planColors[suggestedPlan]} rounded-lg p-6 text-white ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <StarIcon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-white text-opacity-90 mb-4">{description}</p>
          
          <div className="flex items-center space-x-4">
            <Link
              to={`/subscribe/${suggestedPlan}`}
              className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium flex items-center space-x-2"
            >
              <span>Upgrade to {suggestedPlan.charAt(0).toUpperCase() + suggestedPlan.slice(1)}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            
            <Link
              to="/billing"
              className="text-white text-opacity-80 hover:text-opacity-100 text-sm underline"
            >
              View all plans
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function FeatureLock({ 
  feature, 
  requiredPlan = 'pro',
  children,
  fallback = null 
}) {
  // This would normally check subscription status
  // For now, we'll assume it's locked
  const isLocked = true

  if (isLocked) {
    return fallback || (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <LockClosedIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm font-medium">
              {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Feature
            </p>
            <Link
              to={`/subscribe/${requiredPlan}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm underline"
            >
              Upgrade to unlock
            </Link>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  return children
}

export function PlanComparison({ currentPlan = 'free' }) {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: ['3 boards', '5 members', 'Basic templates'],
      current: currentPlan === 'free'
    },
    {
      name: 'Pro',
      price: '₹299',
      period: 'per month',
      features: ['Unlimited boards', '25 members', 'Premium templates', 'Analytics'],
      popular: true,
      current: currentPlan === 'pro'
    },
    {
      name: 'Team',
      price: '₹599',
      period: 'per month',
      features: ['Everything in Pro', '100 members', 'Advanced permissions', 'Phone support'],
      current: currentPlan === 'team'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative p-6 rounded-lg border-2 ${
            plan.current 
              ? 'border-indigo-500 bg-indigo-50' 
              : plan.popular
              ? 'border-purple-500 bg-white shadow-lg'
              : 'border-gray-200 bg-white'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <StarIcon className="h-3 w-3" />
                <span>Popular</span>
              </span>
            </div>
          )}

          {plan.current && (
            <div className="absolute -top-3 right-4">
              <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Current
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {plan.name}
            </h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {plan.price}
              </span>
              <span className="text-gray-600 ml-1">/{plan.period}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {!plan.current && (
            <Link
              to={`/subscribe/${plan.name.toLowerCase()}`}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors text-center block ${
                plan.popular
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Upgrade to {plan.name}
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export function UsageIndicator({ 
  label, 
  current, 
  limit, 
  unit = '',
  warningThreshold = 0.8 
}) {
  const percentage = limit === -1 ? 0 : (current / limit) * 100
  const isWarning = percentage >= warningThreshold * 100
  const isOverLimit = percentage >= 100

  const getColor = () => {
    if (isOverLimit) return 'bg-red-500'
    if (isWarning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
          {current}{unit} {limit === -1 ? '/ Unlimited' : `/ ${limit}${unit}`}
        </span>
      </div>
      
      {limit !== -1 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {isOverLimit && (
        <p className="text-red-600 text-xs">
          You've exceeded your plan limit. Consider upgrading.
        </p>
      )}
    </div>
  )
}
