import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  TagIcon, 
  CalendarIcon,
  UserIcon,
  FlagIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useSubscription } from '../contexts/SubscriptionContext'

export function TimeTracker({ card, onUpdate, disabled = false }) {
  const [isTracking, setIsTracking] = useState(false)
  const [timeSpent, setTimeSpent] = useState(card?.timeSpent || 0)

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setIsTracking(true)
    // In a real app, you'd start an actual timer here
  }

  const stopTimer = () => {
    setIsTracking(false)
    onUpdate({ timeSpent })
  }

  if (disabled) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Time Tracking</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Pro Feature</span>
        </div>
        <p className="text-xs text-gray-500">Track time spent on tasks with Pro plan</p>
      </div>
    )
  }

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Time Tracking</span>
        </div>
        <div className="text-lg font-mono text-blue-900">
          {formatTime(timeSpent)}
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={startTimer}
          disabled={isTracking}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            isTracking 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isTracking ? 'Tracking...' : 'Start'}
        </button>
        <button
          onClick={stopTimer}
          disabled={!isTracking}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            !isTracking 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  )
}

export function CustomFields({ card, onUpdate, disabled = false }) {
  const [fields, setFields] = useState(card?.customFields || [])

  const addField = () => {
    const newField = {
      id: Date.now(),
      name: 'New Field',
      value: '',
      type: 'text'
    }
    const updatedFields = [...fields, newField]
    setFields(updatedFields)
    onUpdate({ customFields: updatedFields })
  }

  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    )
    setFields(updatedFields)
    onUpdate({ customFields: updatedFields })
  }

  const removeField = (fieldId) => {
    const updatedFields = fields.filter(field => field.id !== fieldId)
    setFields(updatedFields)
    onUpdate({ customFields: updatedFields })
  }

  if (disabled) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <TagIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Custom Fields</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Pro Feature</span>
        </div>
        <p className="text-xs text-gray-500">Add custom fields to track additional information</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TagIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">Custom Fields</span>
        </div>
        <button
          onClick={addField}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          + Add Field
        </button>
      </div>
      
      {fields.map((field) => (
        <div key={field.id} className="flex space-x-2">
          <input
            type="text"
            value={field.name}
            onChange={(e) => updateField(field.id, { name: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Field name"
          />
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Field value"
          />
          <button
            onClick={() => removeField(field.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function PrioritySelector({ card, onUpdate, disabled = false }) {
  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  const currentPriority = card?.priority || 'medium'

  if (disabled) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <FlagIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Priority Levels</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Pro Feature</span>
        </div>
        <p className="text-xs text-gray-500">Set task priorities with visual indicators</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <FlagIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">Priority</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {priorities.map((priority) => (
          <button
            key={priority.value}
            onClick={() => onUpdate({ priority: priority.value })}
            className={`p-2 rounded-md text-sm font-medium transition-all ${
              currentPriority === priority.value
                ? `${priority.color} ring-2 ring-offset-1 ring-gray-400`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DueDatePicker({ card, onUpdate, disabled = false }) {
  const [dueDate, setDueDate] = useState(card?.dueDate || '')

  const handleDateChange = (date) => {
    setDueDate(date)
    onUpdate({ dueDate: date })
  }

  if (disabled) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Due Dates</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Pro Feature</span>
        </div>
        <p className="text-xs text-gray-500">Set due dates and get reminders</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <CalendarIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">Due Date</span>
      </div>
      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {dueDate && (
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Due: {new Date(dueDate).toLocaleDateString()}
          </span>
          <button
            onClick={() => handleDateChange('')}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export function AssigneeSelector({ card, onUpdate, disabled = false }) {
  const [assignee, setAssignee] = useState(card?.assignee || '')

  // Mock team members - in real app, this would come from team data
  const teamMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com' }
  ]

  if (disabled) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Assignee</span>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Team Feature</span>
        </div>
        <p className="text-xs text-gray-500">Assign tasks to team members</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <UserIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">Assignee</span>
      </div>
      <select
        value={assignee}
        onChange={(e) => {
          setAssignee(e.target.value)
          onUpdate({ assignee: e.target.value })
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Unassigned</option>
        {teamMembers.map((member) => (
          <option key={member.id} value={member.email}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function PremiumFeatureWrapper({ children, feature, requiredPlan = 'pro' }) {
  const { subscription, hasFeature } = useSubscription()
  
  const hasAccess = hasFeature(feature) || subscription?.plan === requiredPlan || 
                   (requiredPlan === 'pro' && ['team', 'enterprise'].includes(subscription?.plan))

  if (!hasAccess) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <StarIcon className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Feature
            </p>
            <button className="text-indigo-600 hover:text-indigo-700 text-xs underline">
              Upgrade to unlock
            </button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  return children
}
