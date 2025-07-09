import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import Layout from '../components/Layout'
import { debugSubscriptionIssue } from '../utils/debugSubscription'
import toast from 'react-hot-toast'

const planDetails = {
  pro: {
    name: 'Pro',
    price: 299,
    originalPrice: 399,
    features: [
      'Unlimited boards',
      '25 Team members',
      'Premium templates',
      '100GB file storage',
      'Priority support',
      'Advanced analytics',
      'Time tracking',
      'Custom fields'
    ],
    popular: true
  },
  team: {
    name: 'Team',
    price: 599,
    originalPrice: 799,
    features: [
      'Everything in Pro',
      '100 Team members',
      'Advanced permissions',
      '500GB file storage',
      'Phone support',
      'Custom integrations',
      'Advanced automation',
      'Guest access'
    ],
    popular: false
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Everything in Team',
      'Unlimited members',
      'Unlimited storage',
      'Dedicated support',
      'Custom development',
      'On-premise deployment',
      'Advanced security',
      'SLA guarantee'
    ],
    popular: false
  }
}

export default function SubscriptionPage() {
  const { plan } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { subscription, upgradePlan, startTrial } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const selectedPlan = planDetails[plan]

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (!selectedPlan) {
      navigate('/landing')
      return
    }
  }, [currentUser, selectedPlan, navigate])

  const applyCoupon = () => {
    const validCoupons = {
      'WELCOME20': 20,
      'SAVE30': 30,
      'FIRST50': 50
    }

    if (validCoupons[couponCode.toUpperCase()]) {
      setDiscount(validCoupons[couponCode.toUpperCase()])
      toast.success(`Coupon applied! ${validCoupons[couponCode.toUpperCase()]}% discount`)
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const calculateFinalPrice = () => {
    if (selectedPlan.price === 'Custom') return 'Custom'
    const discountAmount = (selectedPlan.price * discount) / 100
    return selectedPlan.price - discountAmount
  }

  const handleStartTrial = async () => {
    setLoading(true)
    try {
      const success = await startTrial(plan)
      if (success) {
        toast.success('Trial started successfully!')
        navigate('/dashboard')
      } else {
        toast.error('Failed to start trial')
      }
    } catch (error) {
      toast.error('Error starting trial')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (selectedPlan.price === 'Custom') {
      toast.info('Please contact sales for enterprise pricing')
      return
    }

    setLoading(true)
    
    try {
      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: calculateFinalPrice() * 100, // Amount in paise
        currency: 'INR',
        name: 'TaskFlow Pro',
        description: `${selectedPlan.name} Plan Subscription`,
        image: '/logo.png',
        handler: async function (response) {
          console.log('Razorpay payment response:', response)
          try {
            const success = await upgradePlan(plan, response)
            if (success) {
              toast.success('Payment successful! Welcome to ' + selectedPlan.name)
              navigate('/dashboard')
            } else {
              toast.error('Failed to upgrade plan. Please contact support.')
              console.error('Upgrade plan failed for user:', currentUser?.uid)
            }
          } catch (error) {
            console.error('Error processing payment:', error)
            toast.error('Error processing payment: ' + error.message)
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
        },
        notes: {
          plan: plan,
          userId: currentUser.uid
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      toast.error('Error initializing payment')
      setLoading(false)
    }
  }

  if (!selectedPlan) {
    return <div>Plan not found</div>
  }

  const isTrialEligible = !subscription?.isTrialActive && plan !== 'enterprise'

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    Upgrade to {selectedPlan.name}
                  </h1>
                  <p className="text-indigo-100 mt-2">
                    Unlock powerful features and boost your productivity
                  </p>
                </div>
                {selectedPlan.popular && (
                  <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Plan Details */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  What's included
                </h2>
                
                <ul className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Trial Info */}
                {isTrialEligible && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">14-Day Free Trial</h3>
                        <p className="text-blue-700 text-sm mt-1">
                          Try all features risk-free. Cancel anytime during the trial period.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Pricing
                  </h2>

                  {/* Price Display */}
                  <div className="mb-6">
                    {selectedPlan.price === 'Custom' ? (
                      <div className="text-3xl font-bold text-gray-900">
                        Custom Pricing
                      </div>
                    ) : (
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{calculateFinalPrice()}
                        </span>
                        <span className="text-gray-600">/month</span>
                        {discount > 0 && (
                          <span className="text-lg text-gray-500 line-through">
                            ₹{selectedPlan.price}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {selectedPlan.originalPrice && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ₹{selectedPlan.originalPrice - selectedPlan.price} per month
                      </p>
                    )}
                  </div>

                  {/* Coupon Code */}
                  {selectedPlan.price !== 'Custom' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code (Optional)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {discount > 0 && (
                        <p className="text-green-600 text-sm mt-1">
                          {discount}% discount applied!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Method */}
                  {selectedPlan.price !== 'Custom' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            value="razorpay"
                            checked={paymentMethod === 'razorpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-indigo-600"
                          />
                          <CreditCardIcon className="h-5 w-5 text-gray-400" />
                          <span>Credit/Debit Card, UPI, Net Banking</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {isTrialEligible && selectedPlan.price !== 'Custom' && (
                      <button
                        onClick={handleStartTrial}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {loading ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
                      </button>
                    )}

                    <button
                      onClick={selectedPlan.price === 'Custom' ? () => toast.info('Contact sales@taskflow.com') : handlePayment}
                      disabled={loading}
                      className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 
                       selectedPlan.price === 'Custom' ? 'Contact Sales' : 
                       `Subscribe for ₹${calculateFinalPrice()}/month`}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Secure payment powered by Razorpay. Cancel anytime.
                  </p>

                  {/* Debug button - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={debugSubscriptionIssue}
                      className="w-full mt-2 py-1 px-2 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                    >
                      Debug Subscription (Dev Only)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
