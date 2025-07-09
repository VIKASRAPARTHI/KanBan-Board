import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../config/firebase'
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'

const SubscriptionContext = createContext()

export function useSubscription() {
  return useContext(SubscriptionContext)
}

const PLAN_LIMITS = {
  free: {
    boards: 3,
    members: 5,
    storage: 10, // MB
    features: ['basic_templates', 'email_support'],
    price: 0
  },
  pro: {
    boards: 50, // Increased from unlimited to 50
    members: 25,
    storage: 100 * 1024, // 100GB in MB
    features: [
      'unlimited_boards', 'premium_templates', 'priority_support',
      'advanced_analytics', 'time_tracking', 'custom_fields', 'priority_levels',
      'due_dates', 'file_attachments', 'board_templates', 'export_data'
    ],
    price: 299
  },
  team: {
    boards: 200, // Increased from unlimited to 200
    members: 100,
    storage: 500 * 1024, // 500GB in MB
    features: [
      'unlimited_boards', 'premium_templates', 'phone_support',
      'advanced_analytics', 'time_tracking', 'custom_fields', 'priority_levels',
      'due_dates', 'file_attachments', 'board_templates', 'export_data',
      'advanced_permissions', 'custom_integrations', 'automation', 'guest_access',
      'team_analytics', 'bulk_operations', 'advanced_search', 'calendar_view'
    ],
    price: 599
  },
  enterprise: {
    boards: -1, // Truly unlimited
    members: -1,
    storage: -1,
    features: [
      'unlimited_boards', 'premium_templates', 'dedicated_support',
      'advanced_analytics', 'time_tracking', 'custom_fields', 'priority_levels',
      'due_dates', 'file_attachments', 'board_templates', 'export_data',
      'advanced_permissions', 'custom_integrations', 'automation', 'guest_access',
      'team_analytics', 'bulk_operations', 'advanced_search', 'calendar_view',
      'custom_development', 'on_premise', 'advanced_security', 'sla', 'api_access'
    ],
    price: 'custom'
  }
}

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(
        doc(db, 'subscriptions', currentUser.uid),
        async (doc) => {
          if (doc.exists()) {
            setSubscription(doc.data())
          } else {
            // Automatically create free subscription for new users
            const defaultSubscription = {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
              endDate: null,
              trialEndDate: null,
              isTrialActive: false,
              paymentMethod: null,
              lastPayment: null,
              nextBilling: null,
              usage: {
                boards: 0,
                members: 0,
                storage: 0
              }
            }

            try {
              await setDoc(doc(db, 'subscriptions', currentUser.uid), defaultSubscription)
              setSubscription(defaultSubscription)
            } catch (error) {
              console.error('Error creating default subscription:', error)
              setSubscription(null)
            }
          }
          setLoading(false)
        },
        (error) => {
          console.error('Error fetching subscription:', error)
          setLoading(false)
        }
      )

      return unsubscribe
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [currentUser])

  const createFreeSubscription = async () => {
    if (!currentUser) return false

    try {
      const defaultSubscription = {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        trialEndDate: null,
        isTrialActive: false,
        paymentMethod: null,
        lastPayment: null,
        nextBilling: null,
        usage: {
          boards: 0,
          members: 0,
          storage: 0
        }
      }

      await setDoc(doc(db, 'subscriptions', currentUser.uid), defaultSubscription)
      return true
    } catch (error) {
      console.error('Error creating free subscription:', error)
      return false
    }
  }

  const getPlanLimits = (planName = subscription?.plan || 'free') => {
    return PLAN_LIMITS[planName] || PLAN_LIMITS.free
  }

  const hasFeature = (feature) => {
    const limits = getPlanLimits()
    return limits.features.includes(feature)
  }

  const canCreateBoard = (currentBoardCount = 0) => {
    if (!subscription) return false
    const limits = getPlanLimits()
    if (limits.boards === -1) return true
    return currentBoardCount < limits.boards
  }

  const canAddMember = () => {
    if (!subscription) return false
    const limits = getPlanLimits()
    if (limits.members === -1) return true
    return subscription.usage.members < limits.members
  }

  const canUploadFile = (fileSize) => {
    if (!subscription) return false
    const limits = getPlanLimits()
    if (limits.storage === -1) return true
    const currentStorageMB = subscription.usage.storage
    const fileSizeMB = fileSize / (1024 * 1024)
    return (currentStorageMB + fileSizeMB) <= limits.storage
  }

  const updateUsage = async (type, increment = 1) => {
    if (!currentUser || !subscription) return

    const newUsage = {
      ...subscription.usage,
      [type]: Math.max(0, subscription.usage[type] + increment)
    }

    try {
      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        usage: newUsage
      })
    } catch (error) {
      console.error('Error updating usage:', error)
    }
  }

  const upgradePlan = async (newPlan, paymentData = null) => {
    if (!currentUser) {
      console.error('No current user found')
      return false
    }

    console.log('Upgrading plan for user:', currentUser.uid, 'to plan:', newPlan)
    console.log('Payment data:', paymentData)

    try {
      const now = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

      const updateData = {
        plan: newPlan,
        status: paymentData ? 'active' : 'trial',
        startDate: now,
        endDate: endDate,
        lastPayment: paymentData ? {
          amount: PLAN_LIMITS[newPlan].price,
          date: now,
          method: 'razorpay',
          transactionId: paymentData.razorpay_payment_id
        } : null,
        nextBilling: endDate,
        updatedAt: now,
        updatedBy: currentUser.uid
      }

      // If upgrading to paid plan without payment, start trial if eligible
      if (newPlan !== 'free' && !paymentData && !subscription?.isTrialActive) {
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 14) // 14 days trial
        updateData.isTrialActive = true
        updateData.trialEndDate = trialEndDate
        updateData.status = 'trial'
        updateData.nextBilling = trialEndDate
      }

      console.log('Update data:', updateData)

      // Check if subscription document exists, if not create it
      const subscriptionRef = doc(db, 'subscriptions', currentUser.uid)
      await updateDoc(subscriptionRef, updateData)

      console.log('Plan upgraded successfully')
      return true
    } catch (error) {
      console.error('Error upgrading plan:', error)
      console.error('Error details:', error.message)

      // If document doesn't exist, create it
      if (error.code === 'not-found') {
        try {
          console.log('Creating new subscription document')
          const newSubscription = {
            plan: newPlan,
            status: paymentData ? 'active' : 'trial',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            trialEndDate: paymentData ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            isTrialActive: !paymentData,
            paymentMethod: null,
            lastPayment: paymentData ? {
              amount: PLAN_LIMITS[newPlan].price,
              date: new Date(),
              method: 'razorpay',
              transactionId: paymentData.razorpay_payment_id
            } : null,
            nextBilling: paymentData ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            usage: {
              boards: 0,
              members: 0,
              storage: 0
            },
            createdAt: new Date(),
            createdBy: currentUser.uid
          }

          await setDoc(doc(db, 'subscriptions', currentUser.uid), newSubscription)
          console.log('New subscription document created')
          return true
        } catch (createError) {
          console.error('Error creating subscription document:', createError)
          return false
        }
      }

      return false
    }
  }

  const cancelSubscription = async () => {
    if (!currentUser) return false

    try {
      // Revert to free plan instead of just cancelling
      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        plan: 'free',
        status: 'active',
        endDate: null,
        trialEndDate: null,
        isTrialActive: false,
        paymentMethod: null,
        lastPayment: null,
        nextBilling: null,
        cancelledAt: new Date(),
        previousPlan: subscription?.plan || 'pro' // Store what they had before
      })
      return true
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
  }

  const startTrial = async (planName) => {
    if (!currentUser || subscription?.isTrialActive) return false

    try {
      const now = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14) // 14 days trial

      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        plan: planName,
        status: 'trial',
        isTrialActive: true,
        trialEndDate: trialEndDate,
        startDate: now,
        nextBilling: trialEndDate
      })
      return true
    } catch (error) {
      console.error('Error starting trial:', error)
      return false
    }
  }

  const isTrialExpired = () => {
    if (!subscription?.isTrialActive || !subscription?.trialEndDate) return false
    return new Date() > subscription.trialEndDate.toDate()
  }

  const getTrialDaysLeft = () => {
    if (!subscription?.isTrialActive || !subscription?.trialEndDate) return 0
    const now = new Date()
    const trialEnd = subscription.trialEndDate.toDate()
    const diffTime = trialEnd - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const isPaidSubscription = () => {
    return subscription?.status === 'active' && subscription?.lastPayment && !subscription?.isTrialActive
  }

  const isTrialSubscription = () => {
    return subscription?.status === 'trial' && subscription?.isTrialActive && !isTrialExpired()
  }

  const value = {
    subscription,
    loading,
    getPlanLimits,
    hasFeature,
    canCreateBoard,
    canAddMember,
    canUploadFile,
    updateUsage,
    upgradePlan,
    cancelSubscription,
    startTrial,
    isTrialExpired,
    getTrialDaysLeft,
    createFreeSubscription,
    isPaidSubscription,
    isTrialSubscription,
    planLimits: PLAN_LIMITS
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}
