import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useSubscription } from '../contexts/SubscriptionContext'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const { subscription, cancelSubscription, getPlanLimits, getTrialDaysLeft, isTrialExpired } = useSubscription()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const navigate = useNavigate()

  const planLimits = getPlanLimits()
  const trialDaysLeft = getTrialDaysLeft()

  const handleCancelSubscription = async () => {
    try {
      const success = await cancelSubscription()
      if (success) {
        toast.success('Subscription cancelled. You now have a Free plan with full access to basic features.')
        setShowCancelModal(false)
      } else {
        toast.error('Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('Error cancelling subscription')
    }
  }

  const downloadInvoice = (invoiceId) => {
    // Mock invoice download
    toast.success('Invoice downloaded successfully')
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'trial': return 'text-blue-600 bg-blue-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Mock invoice data
  const invoices = [
    {
      id: 'INV-001',
      date: new Date('2024-01-15'),
      amount: 299,
      status: 'paid',
      plan: 'Pro'
    },
    {
      id: 'INV-002',
      date: new Date('2023-12-15'),
      amount: 299,
      status: 'paid',
      plan: 'Pro'
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600 mt-2">Manage your subscription and billing information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.status)}`}>
                    {subscription?.status || 'Unknown'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Free'} Plan
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {planLimits.price === 0 ? 'Free forever' : 
                       planLimits.price === 'custom' ? 'Custom pricing' : 
                       `₹${planLimits.price}/month`}
                    </p>

                    {subscription?.isTrialActive && (
                      <div className="mb-4">
                        {isTrialExpired() ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">Trial Expired</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <CalendarIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              {trialDaysLeft} days left in trial
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Boards:</span>
                        <span>
                          {subscription?.usage?.boards || 0}
                          {planLimits.boards === -1 ? ' / Unlimited' : ` / ${planLimits.boards}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span>
                          {subscription?.usage?.members || 0}
                          {planLimits.members === -1 ? ' / Unlimited' : ` / ${planLimits.members}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span>
                          {((subscription?.usage?.storage || 0) / 1024).toFixed(1)} GB
                          {planLimits.storage === -1 ? ' / Unlimited' : ` / ${(planLimits.storage / 1024).toFixed(0)} GB`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Billing Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span>{formatDate(subscription?.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Billing:</span>
                        <span>{formatDate(subscription?.nextBilling)}</span>
                      </div>
                      {subscription?.lastPayment && (
                        <div className="flex justify-between">
                          <span>Last Payment:</span>
                          <span>₹{subscription.lastPayment.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  {subscription?.plan === 'free' && (
                    <button
                      onClick={() => navigate('/subscribe/pro')}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                  {subscription?.plan === 'pro' && (
                    <button
                      onClick={() => navigate('/subscribe/team')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Upgrade to Team
                    </button>
                  )}
                  {subscription?.plan === 'team' && (
                    <button
                      onClick={() => navigate('/subscribe/enterprise')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Contact for Enterprise
                    </button>
                  )}
                  {subscription?.plan !== 'free' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Invoices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {invoice.date.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{invoice.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => downloadInvoice(invoice.id)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Update Payment Method</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Download All Invoices</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors">
                    <CogIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Billing Settings</span>
                  </button>
                </div>
              </motion.div>

              {/* Support */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-indigo-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Need Help?</h3>
                <p className="text-indigo-700 text-sm mb-4">
                  Our billing support team is here to help with any questions.
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
                  Contact Support
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancel Subscription
              </h3>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to cancel your {subscription?.plan} subscription?
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Don't worry!</strong> You'll automatically be moved to our Free plan and keep access to:
                  </p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• 3 personal boards</li>
                    <li>• 5 team members</li>
                    <li>• Basic templates</li>
                    <li>• 10MB storage</li>
                  </ul>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Keep {subscription?.plan} Plan
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Switch to Free Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  )
}
