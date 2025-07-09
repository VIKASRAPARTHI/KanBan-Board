import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LockClosedIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { PageLoader } from '../components/LoadingSpinner'

export default function SubscriptionGate({ children }) {
  const { currentUser } = useAuth()
  const { subscription, loading } = useSubscription()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If user is not authenticated, let the ProtectedRoute handle it
    if (!currentUser) return

    // If subscription is still loading, wait
    if (loading) return

    // If user has no subscription at all, redirect to plan selection
    if (!subscription) {
      navigate('/plans', { replace: true })
      return
    }

    // If subscription is cancelled or expired, redirect to plan selection
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      navigate('/plans', { replace: true })
      return
    }

    // If trial has expired and user is not on a paid plan, redirect to subscription
    if (subscription.isTrialActive && subscription.status === 'trial') {
      const trialEndDate = subscription.trialEndDate?.toDate ? 
        subscription.trialEndDate.toDate() : 
        new Date(subscription.trialEndDate)
      
      if (new Date() > trialEndDate) {
        navigate('/subscribe/pro', { replace: true })
        return
      }
    }
  }, [currentUser, subscription, loading, navigate])

  // Show loading while checking subscription
  if (loading) {
    return <PageLoader />
  }

  // If no subscription, show access denied
  if (!subscription) {
    return <AccessDenied reason="no-subscription" />
  }

  // If subscription is cancelled or expired
  if (subscription.status === 'cancelled' || subscription.status === 'expired') {
    return <AccessDenied reason="subscription-expired" />
  }

  // If trial has expired
  if (subscription.isTrialActive && subscription.status === 'trial') {
    const trialEndDate = subscription.trialEndDate?.toDate ? 
      subscription.trialEndDate.toDate() : 
      new Date(subscription.trialEndDate)
    
    if (new Date() > trialEndDate) {
      return <AccessDenied reason="trial-expired" />
    }
  }

  // User has valid subscription, allow access
  return children
}

function AccessDenied({ reason }) {
  const navigate = useNavigate()

  const getContent = () => {
    switch (reason) {
      case 'no-subscription':
        return {
          icon: LockClosedIcon,
          title: 'Choose Your Plan',
          description: 'To access TaskFlow Pro, please select a subscription plan that fits your needs.',
          primaryAction: {
            text: 'Choose Plan',
            onClick: () => navigate('/plans')
          },
          secondaryAction: {
            text: 'Start Free Trial',
            onClick: () => navigate('/subscribe/pro')
          }
        }
      
      case 'subscription-expired':
        return {
          icon: StarIcon,
          title: 'Subscription Expired',
          description: 'Your subscription has expired. Renew now to continue using TaskFlow Pro.',
          primaryAction: {
            text: 'Renew Subscription',
            onClick: () => navigate('/billing')
          },
          secondaryAction: {
            text: 'View Plans',
            onClick: () => navigate('/plans')
          }
        }
      
      case 'trial-expired':
        return {
          icon: StarIcon,
          title: 'Trial Period Ended',
          description: 'Your 14-day free trial has ended. Upgrade to continue using premium features.',
          primaryAction: {
            text: 'Upgrade Now',
            onClick: () => navigate('/subscribe/pro')
          },
          secondaryAction: {
            text: 'View Plans',
            onClick: () => navigate('/plans')
          }
        }

      default:
        return {
          icon: LockClosedIcon,
          title: 'Access Restricted',
          description: 'You need an active subscription to access this feature.',
          primaryAction: {
            text: 'View Plans',
            onClick: () => navigate('/plans')
          }
        }
    }
  }

  const content = getContent()
  const Icon = content.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6"
          >
            <Icon className="h-8 w-8 text-indigo-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {content.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={content.primaryAction.onClick}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <span>{content.primaryAction.text}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>

            {content.secondaryAction && (
              <button
                onClick={content.secondaryAction.onClick}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {content.secondaryAction.text}
              </button>
            )}
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500 mb-4">What you'll get:</p>
            <div className="space-y-2">
              {[
                'Unlimited Kanban boards',
                'Team collaboration tools',
                'Advanced analytics',
                'Priority support'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
