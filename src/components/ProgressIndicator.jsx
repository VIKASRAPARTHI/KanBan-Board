import { motion } from 'framer-motion'

export function LinearProgress({ value, max = 100, className = '', showLabel = true }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-indigo-600 h-2 rounded-full"
        />
      </div>
    </div>
  )
}

export function CircularProgress({ value, max = 100, size = 40, strokeWidth = 4, className = '' }) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-indigo-600"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

export function StepProgress({ steps, currentStep, className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.id || index} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'bg-indigo-600 text-white'
                    : isCurrent
                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={`mt-2 text-xs font-medium ${
                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title || step.name || `Step ${index + 1}`}
              </span>
            </div>
            {!isLast && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isCompleted ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 h-0.5 bg-indigo-600 mx-4 origin-left"
                style={{ minWidth: '2rem' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function BoardProgress({ board }) {
  if (!board || !board.lists) return null

  const totalCards = board.lists.reduce((acc, list) => acc + (list.cards?.length || 0), 0)
  const completedCards = board.lists
    .find(list => list.id === 'done' || list.title.toLowerCase().includes('done') || list.title.toLowerCase().includes('completed'))
    ?.cards?.length || 0

  if (totalCards === 0) return null

  return (
    <div className="flex items-center space-x-3">
      <CircularProgress value={completedCards} max={totalCards} size={32} strokeWidth={3} />
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {completedCards} of {totalCards} completed
        </div>
        <div className="text-gray-500">
          {totalCards - completedCards} remaining
        </div>
      </div>
    </div>
  )
}

export function TaskProgress({ tasks }) {
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  if (totalTasks === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tasks completed</span>
        <span className="font-medium text-gray-900">
          {completedTasks}/{totalTasks}
        </span>
      </div>
      <LinearProgress value={completedTasks} max={totalTasks} showLabel={false} />
    </div>
  )
}

export function LoadingProgress({ message = 'Loading...', progress }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center space-y-4 p-8"
    >
      <div className="w-16 h-16">
        <CircularProgress 
          value={progress || 0} 
          max={100} 
          size={64} 
          strokeWidth={4}
        />
      </div>
      <p className="text-sm text-gray-600">{message}</p>
    </motion.div>
  )
}
