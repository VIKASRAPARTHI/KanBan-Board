import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  RocketLaunchIcon,
  SparklesIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export function EmptyBoardsState({ onCreateBoard }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6"
      >
        <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-600" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-gray-900 mb-2"
      >
        No boards yet
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-500 mb-8 max-w-sm mx-auto"
      >
        Create your first board to start organizing your tasks and projects with our intuitive Kanban system.
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateBoard}
        className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Create Your First Board</span>
      </motion.button>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-center space-x-8 text-sm text-gray-400"
      >
        <div className="flex items-center space-x-2">
          <RocketLaunchIcon className="h-4 w-4" />
          <span>Project Management</span>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-4 w-4" />
          <span>Personal Tasks</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function EmptyListState({ listName, onAddCard }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        No cards in {listName}
      </h4>
      
      <p className="text-xs text-gray-500 mb-4">
        Add your first card to get started
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddCard}
        className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
      >
        <PlusIcon className="h-3 w-3" />
        <span>Add Card</span>
      </motion.button>
    </motion.div>
  )
}

export function SearchEmptyState({ searchTerm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No results found
      </h3>
      
      <p className="text-gray-500 mb-4">
        No boards match "{searchTerm}". Try adjusting your search.
      </p>
      
      <button className="text-indigo-600 hover:text-indigo-700 font-medium">
        Clear search
      </button>
    </motion.div>
  )
}

export function ErrorState({ title, message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || 'Something went wrong'}
      </h3>
      
      <p className="text-gray-500 mb-6">
        {message || 'We encountered an error while loading your data.'}
      </p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  )
}
