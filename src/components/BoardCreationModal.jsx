import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  XMarkIcon, 
  RocketLaunchIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { db } from '../config/firebase'
import { collection, addDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

const boardTemplates = [
  {
    id: 'basic',
    name: 'Basic Kanban',
    description: 'Simple three-column board',
    icon: SparklesIcon,
    color: 'bg-blue-500',
    lists: [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'inprogress', title: 'In Progress', cards: [] },
      { id: 'done', title: 'Done', cards: [] }
    ]
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Complete project workflow',
    icon: BriefcaseIcon,
    color: 'bg-green-500',
    lists: [
      { id: 'backlog', title: 'Backlog', cards: [] },
      { id: 'planning', title: 'Planning', cards: [] },
      { id: 'development', title: 'Development', cards: [] },
      { id: 'testing', title: 'Testing', cards: [] },
      { id: 'deployment', title: 'Deployment', cards: [] },
      { id: 'completed', title: 'Completed', cards: [] }
    ]
  },
  {
    id: 'sprint',
    name: 'Sprint Board',
    description: 'Agile sprint planning',
    icon: RocketLaunchIcon,
    color: 'bg-purple-500',
    lists: [
      { id: 'sprint-backlog', title: 'Sprint Backlog', cards: [] },
      { id: 'in-progress', title: 'In Progress', cards: [] },
      { id: 'review', title: 'Review', cards: [] },
      { id: 'done', title: 'Done', cards: [] }
    ]
  },
  {
    id: 'personal',
    name: 'Personal Tasks',
    description: 'Personal productivity board',
    icon: HeartIcon,
    color: 'bg-pink-500',
    lists: [
      { id: 'ideas', title: 'Ideas', cards: [] },
      { id: 'today', title: 'Today', cards: [] },
      { id: 'this-week', title: 'This Week', cards: [] },
      { id: 'completed', title: 'Completed', cards: [] }
    ]
  },
  {
    id: 'learning',
    name: 'Learning Path',
    description: 'Track your learning journey',
    icon: AcademicCapIcon,
    color: 'bg-yellow-500',
    lists: [
      { id: 'to-learn', title: 'To Learn', cards: [] },
      { id: 'learning', title: 'Learning', cards: [] },
      { id: 'practicing', title: 'Practicing', cards: [] },
      { id: 'mastered', title: 'Mastered', cards: [] }
    ]
  },
  // Premium Templates (Pro & Team only)
  {
    id: 'sprint',
    name: 'Sprint Planning',
    description: 'Agile sprint management with story points',
    icon: RocketLaunchIcon,
    color: 'bg-purple-500',
    premium: true,
    requiredPlan: 'pro',
    lists: [
      { id: 'product-backlog', title: 'Product Backlog', cards: [] },
      { id: 'sprint-backlog', title: 'Sprint Backlog', cards: [] },
      { id: 'in-progress', title: 'In Progress', cards: [] },
      { id: 'code-review', title: 'Code Review', cards: [] },
      { id: 'testing', title: 'Testing', cards: [] },
      { id: 'done', title: 'Done', cards: [] }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns',
    icon: SparklesIcon,
    color: 'bg-orange-500',
    premium: true,
    requiredPlan: 'pro',
    lists: [
      { id: 'ideas', title: 'Campaign Ideas', cards: [] },
      { id: 'planning', title: 'Planning', cards: [] },
      { id: 'content-creation', title: 'Content Creation', cards: [] },
      { id: 'review', title: 'Review & Approval', cards: [] },
      { id: 'scheduled', title: 'Scheduled', cards: [] },
      { id: 'live', title: 'Live', cards: [] },
      { id: 'completed', title: 'Completed', cards: [] }
    ]
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Track leads and sales opportunities',
    icon: BriefcaseIcon,
    color: 'bg-green-600',
    premium: true,
    requiredPlan: 'pro',
    lists: [
      { id: 'leads', title: 'New Leads', cards: [] },
      { id: 'qualified', title: 'Qualified', cards: [] },
      { id: 'proposal', title: 'Proposal Sent', cards: [] },
      { id: 'negotiation', title: 'Negotiation', cards: [] },
      { id: 'closed-won', title: 'Closed Won', cards: [] },
      { id: 'closed-lost', title: 'Closed Lost', cards: [] }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Strategic product planning and feature tracking',
    icon: AcademicCapIcon,
    color: 'bg-indigo-600',
    premium: true,
    requiredPlan: 'team',
    lists: [
      { id: 'research', title: 'Research', cards: [] },
      { id: 'planned', title: 'Planned', cards: [] },
      { id: 'q1', title: 'Q1 2024', cards: [] },
      { id: 'q2', title: 'Q2 2024', cards: [] },
      { id: 'q3', title: 'Q3 2024', cards: [] },
      { id: 'released', title: 'Released', cards: [] }
    ]
  },
  {
    id: 'hr-recruitment',
    name: 'HR Recruitment',
    description: 'Manage hiring process and candidate pipeline',
    icon: HeartIcon,
    color: 'bg-teal-500',
    premium: true,
    requiredPlan: 'team',
    lists: [
      { id: 'applications', title: 'Applications', cards: [] },
      { id: 'screening', title: 'Phone Screening', cards: [] },
      { id: 'interview-1', title: 'First Interview', cards: [] },
      { id: 'interview-2', title: 'Final Interview', cards: [] },
      { id: 'reference', title: 'Reference Check', cards: [] },
      { id: 'offer', title: 'Offer Extended', cards: [] },
      { id: 'hired', title: 'Hired', cards: [] },
      { id: 'rejected', title: 'Rejected', cards: [] }
    ]
  }
]

export default function BoardCreationModal({ isOpen, onClose, onBoardCreated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(boardTemplates[0])
  const [step, setStep] = useState(1) // 1: Template selection, 2: Board details
  const { currentUser } = useAuth()
  const { subscription, hasFeature } = useSubscription()

  // Filter templates based on subscription plan
  const availableTemplates = boardTemplates.filter(template => {
    if (!template.premium) return true // Free templates

    const userPlan = subscription?.plan || 'free'
    if (userPlan === 'free') return false

    // Check if user's plan meets the required plan
    const planHierarchy = { 'pro': 1, 'team': 2, 'enterprise': 3 }
    const userPlanLevel = planHierarchy[userPlan] || 0
    const requiredPlanLevel = planHierarchy[template.requiredPlan] || 0

    return userPlanLevel >= requiredPlanLevel
  })
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const handleClose = () => {
    setStep(1)
    setSelectedTemplate(boardTemplates[0])
    reset()
    onClose()
  }

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Creating board...')
    
    try {
      const boardData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        userId: currentUser.uid,
        template: selectedTemplate.id,
        lists: selectedTemplate.lists,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'boards'), boardData)
      
      toast.success('Board created successfully!', { id: loadingToast })
      onBoardCreated({ id: docRef.id, ...boardData })
      handleClose()
    } catch (error) {
      console.error('Error creating board:', error)
      toast.error('Failed to create board', { id: loadingToast })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel as={motion.div}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {step === 1 ? 'Choose a Template' : 'Board Details'}
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {step === 1 ? (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <p className="text-gray-600">
                          Select a template to get started quickly, or choose Basic Kanban for a simple setup.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Available Templates */}
                          {availableTemplates.map((template) => {
                            const Icon = template.icon
                            return (
                              <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTemplate(template)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedTemplate.id === template.id
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`p-2 rounded-lg ${template.color}`}>
                                    <Icon className="h-5 w-5 text-white" />
                                  </div>
                                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                <div className="text-xs text-gray-500">
                                  {template.lists.length} columns
                                </div>
                              </motion.div>
                            )
                          })}

                          {/* Premium Templates Preview for Free Users */}
                          {subscription?.plan === 'free' && (
                            <>
                              {boardTemplates.filter(t => t.premium && t.requiredPlan === 'pro').slice(0, 2).map((template) => {
                                const Icon = template.icon
                                return (
                                  <motion.div
                                    key={template.id}
                                    className="relative p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 opacity-75"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                                      <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-xs font-medium text-indigo-600">Pro Feature</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3 mb-3">
                                      <div className={`p-2 rounded-lg ${template.color}`}>
                                        <Icon className="h-5 w-5 text-white" />
                                      </div>
                                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {template.lists.slice(0, 3).map((list, idx) => (
                                        <span key={idx} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                          {list.title}
                                        </span>
                                      ))}
                                      {template.lists.length > 3 && (
                                        <span className="text-xs text-gray-500">+{template.lists.length - 3} more</span>
                                      )}
                                    </div>
                                  </motion.div>
                                )
                              })}
                              <motion.div className="p-4 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center text-center min-h-[200px]">
                                <SparklesIcon className="h-8 w-8 text-indigo-500 mb-2" />
                                <h4 className="font-medium text-indigo-900 mb-1">Unlock Premium Templates</h4>
                                <p className="text-sm text-indigo-700 mb-3">Get access to 5+ professional templates</p>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                                  Upgrade to Pro
                                </button>
                              </motion.div>
                            </>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                          <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            Cancel
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStep(2)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            Next
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-lg ${selectedTemplate.color}`}>
                            <selectedTemplate.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Board Name *
                            </label>
                            <input
                              {...register('name', { required: 'Board name is required' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                              placeholder="Enter board name..."
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description (Optional)
                            </label>
                            <textarea
                              {...register('description')}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                              placeholder="Describe your board..."
                            />
                          </div>

                          <div className="flex justify-between space-x-3 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              Back
                            </button>
                            <div className="space-x-3">
                              <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                              >
                                Cancel
                              </button>
                              <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                              >
                                Create Board
                              </motion.button>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </AnimatePresence>
  )
}
