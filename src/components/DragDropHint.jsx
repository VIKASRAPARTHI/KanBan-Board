import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

export default function DragDropHint() {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem('kanban-drag-hint-seen')
    if (!hasSeenHint) {
      // Show hint after a short delay
      const timer = setTimeout(() => {
        setShowHint(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // const handleDragstart = () => {
  //   setShowHint(false);
  // }

  const dismissHint = () => {
    setShowHint(false)
    localStorage.setItem('kanban-drag-hint-seen', 'true')
  }

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg border border-indigo-500">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <ArrowsUpDownIcon className="h-6 w-6 text-indigo-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">Drag & Drop Cards</h4>
                <p className="text-sm text-indigo-100">
                  You can drag cards between columns to update their status. 
                  Try moving a card from "To Do" to "In Progress"!
                </p>
              </div>
              <button
                onClick={dismissHint}
                className="flex-shrink-0 text-indigo-200 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
