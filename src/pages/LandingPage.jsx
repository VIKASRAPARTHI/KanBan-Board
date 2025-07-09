import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckIcon,
  ArrowRightIcon,
  PlayIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CloudIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

const features = [
  {
    icon: UsersIcon,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time updates and team management.'
  },
  {
    icon: ClockIcon,
    title: 'Time Tracking',
    description: 'Track time spent on tasks and generate detailed productivity reports.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Advanced Security',
    description: 'Enterprise-grade security with data encryption and access controls.'
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics & Reports',
    description: 'Gain insights with powerful analytics and customizable reports.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud Storage',
    description: 'Secure cloud storage for all your files and attachments.'
  },
  {
    icon: CogIcon,
    title: 'Automation',
    description: 'Automate repetitive tasks and streamline your workflow.'
  }
]

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for individuals getting started',
    features: [
      '3 Personal boards',
      '5 Team members',
      'Basic templates',
      '10MB file storage',
      'Email support'
    ],
    limitations: [
      'Limited integrations',
      'Basic reporting'
    ],
    popular: false,
    cta: 'Get Started Free'
  },
  {
    name: 'Pro',
    price: '₹299',
    period: 'per month',
    description: 'Best for growing teams and professionals',
    features: [
      '50 boards',
      '25 Team members',
      'Premium templates',
      '100GB file storage',
      'Priority support',
      'Advanced analytics',
      'Time tracking',
      'Custom fields',
      'Priority levels',
      'Due dates & reminders'
    ],
    limitations: [],
    popular: true,
    cta: 'Start 14-day Free Trial',
    trial: '14-day free trial'
  },
  {
    name: 'Team',
    price: '₹599',
    period: 'per month',
    description: 'For larger teams that need advanced features',
    features: [
      '200 boards',
      '100 Team members',
      'Advanced permissions',
      '500GB file storage',
      'Phone support',
      'Custom integrations',
      'Advanced automation',
      'Guest access',
      'Team analytics',
      'Calendar view'
    ],
    limitations: [],
    popular: false,
    cta: 'Start 14-day Free Trial',
    trial: '14-day free trial'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations with specific needs',
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
    limitations: [],
    popular: false,
    cta: 'Contact Sales'
  }
]

export default function LandingPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (currentUser) {
      // If user is already logged in, go to dashboard
      navigate('/dashboard')
    } else {
      // If not logged in, go to register
      navigate('/register')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-indigo-600"
              >
                TaskFlow Pro
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Streamline Your
              <span className="text-indigo-600"> Workflow</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              The most powerful Kanban board for teams. Organize projects, track progress, 
              and collaborate seamlessly with advanced features and beautiful design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleGetStarted}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 text-lg font-medium"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              
              <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors">
                <PlayIcon className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm text-gray-500 mt-4"
            >
              14-day free trial • No credit card required • Cancel anytime
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help teams work more efficiently and achieve better results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose your plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative p-6 rounded-lg border-2 ${
                  plan.popular 
                    ? 'border-indigo-500 bg-white shadow-lg' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
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
                    {plan.period !== 'contact us' && (
                      <span className="text-gray-600 ml-1">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>
                  {plan.trial && (
                    <p className="text-indigo-600 text-sm font-medium mt-1">
                      {plan.trial}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using TaskFlow Pro to achieve their goals.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">TaskFlow Pro</h3>
            <p className="text-gray-400 mb-4">
              The ultimate project management solution for modern teams.
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 TaskFlow Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
