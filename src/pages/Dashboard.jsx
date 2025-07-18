import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import { Plus, Calendar, User, X, Edit3, MoreVertical, Trash2, Search, GripVertical } from 'lucide-react'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout'
import CardModal from '../components/CardModal'
import BoardCreationModal from '../components/BoardCreationModal'
import { SkeletonBoard } from '../components/LoadingSpinner'
import { EmptyBoardsState, EmptyListState } from '../components/EmptyState'
import { BoardProgress } from '../components/ProgressIndicator'
import DragDropHint from '../components/DragDropHint'
import DynamicUpgradeModal from '../components/DynamicUpgradeModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [boards, setBoards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentBoardId, setCurrentBoardId] = useState(null)
  const [currentListId, setCurrentListId] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, reason: '' })
  const { currentUser } = useAuth()
  const { canCreateBoard, getPlanLimits, subscription, loading: subscriptionLoading, ensureSubscriptionExists } = useSubscription()

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'boards'), where('userId', '==', currentUser.uid))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const boardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBoards(boardsData)
        setLoading(false)
      })
      return unsubscribe
    }
  }, [currentUser])

  // Ensure subscription exists for new users
  useEffect(() => {
    const checkSubscription = async () => {
      if (currentUser && !subscriptionLoading && !subscription) {
        console.log('User has no subscription, creating free subscription...')
        await ensureSubscriptionExists()
      }
    }

    checkSubscription()
  }, [currentUser, subscription, subscriptionLoading, ensureSubscriptionExists])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        document.querySelector('input[placeholder="Search boards..."]')?.focus()
      }
      // Escape to clear search
      if (event.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchTerm])

  // Filter boards based on search term
  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleBoardCreated = () => {
    // Board is already added to Firestore, so it will appear via the real-time listener
    setIsBoardModalOpen(false)
  }

  const handleCreateBoard = async () => {
    console.log('handleCreateBoard called:', {
      boardsLength: boards.length,
      subscription,
      subscriptionLoading,
      canCreate: canCreateBoard(boards.length)
    })

    // Wait for subscription to load
    if (subscriptionLoading) {
      console.log('Subscription still loading, please wait...')
      return
    }

    // Ensure subscription exists
    if (!subscription) {
      console.log('No subscription found, creating one...')
      const created = await ensureSubscriptionExists()
      if (!created) {
        toast.error('Failed to set up your account. Please try again.')
        return
      }
      // Wait a moment for the subscription to be set
      setTimeout(() => {
        console.log('Subscription should now exist, retrying...')
        handleCreateBoard()
      }, 1000)
      return
    }

    if (!canCreateBoard(boards.length)) {
      setUpgradeModal({ isOpen: true, reason: 'board_limit' })
      return
    }
    setIsBoardModalOpen(true)
  }

  const deleteBoard = async (boardId, boardName) => {
    const confirmed = confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)

    if (!confirmed) return

    const loadingToast = toast.loading('Deleting board...')

    try {
      await deleteDoc(doc(db, 'boards', boardId))
      toast.success('Board deleted successfully!', { id: loadingToast })
      setOpenDropdown(null)
    } catch (error) {
      console.error('Error deleting board:', error)
      toast.error('Failed to delete board', { id: loadingToast })
    }
  }

  const openCardModal = (card = null, boardId = null, listId = null) => {
    setSelectedCard(card)
    setCurrentBoardId(boardId)
    setCurrentListId(listId)
    setIsCardModalOpen(true)
  }

  const closeCardModal = () => {
    setSelectedCard(null)
    setCurrentBoardId(null)
    setCurrentListId(null)
    setIsCardModalOpen(false)
  }

  const saveCard = async (cardData) => {
    const loadingToast = toast.loading(selectedCard ? 'Updating card...' : 'Creating card...')

    try {
      const board = boards.find(b => b.id === currentBoardId)
      if (!board) return

      let updatedLists

      if (selectedCard) {
        // Update existing card
        updatedLists = board.lists.map(list => ({
          ...list,
          cards: (list.cards || []).map(card =>
            card.id === selectedCard.id ? cardData : card
          )
        }))
      } else {
        // Create new card
        const newCard = {
          ...cardData,
          id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString()
        }

        updatedLists = board.lists.map(list =>
          list.id === currentListId
            ? { ...list, cards: [...(list.cards || []), newCard] }
            : list
        )
      }

      await updateDoc(doc(db, 'boards', currentBoardId), { lists: updatedLists })
      toast.success(selectedCard ? 'Card updated successfully!' : 'Card created successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Error saving card:', error)
      toast.error('Failed to save card', { id: loadingToast })
    }
  }

  const addCard = async (boardId, listId) => {
    openCardModal(null, boardId, listId)
  }

  const onDragStart = () => {
    // Optional: Add any drag start logic here
    // Could add visual feedback or analytics here
  }

  const deleteCard = async (cardId) => {
    const loadingToast = toast.loading('Deleting card...')

    try {
      const board = boards.find(b => b.id === currentBoardId)
      if (!board) return

      const updatedLists = board.lists.map(list => ({
        ...list,
        cards: (list.cards || []).filter(c => c.id !== cardId)
      }))

      await updateDoc(doc(db, 'boards', currentBoardId), { lists: updatedLists })
      toast.success('Card deleted successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Failed to delete card', { id: loadingToast })
    }
  }

  const onDragEnd = useCallback(async (result) => {
    // Early return if no destination or invalid result
    if (!result || !result.destination || !result.source || !result.draggableId) {
      return
    }

    const { source, destination, draggableId } = result

    // No change if dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceBoardId = source.droppableId.split('-')[0]
    const destBoardId = destination.droppableId.split('-')[0]

    // Only allow moving within the same board
    if (sourceBoardId !== destBoardId) {
      toast.error('Cannot move cards between different boards')
      return
    }

    const board = boards.find(b => b.id === sourceBoardId)
    if (!board || !board.lists) {
      toast.error('Board not found')
      return
    }

    const sourceListId = source.droppableId.split('-')[1]
    const destListId = destination.droppableId.split('-')[1]

    const sourceList = board.lists.find(l => l.id === sourceListId)
    const destList = board.lists.find(l => l.id === destListId)

    if (!sourceList || !sourceList.cards) {
      toast.error('Source list not found')
      return
    }

    const card = sourceList.cards.find(c => c.id === draggableId)
    if (!card) {
      toast.error('Card not found')
      return
    }

    const loadingToast = toast.loading('Moving card...')

    try {
      let updatedLists

      if (sourceListId === destListId) {
        // Same list reordering
        const newCards = [...sourceList.cards]
        newCards.splice(source.index, 1)
        newCards.splice(destination.index, 0, card)

        updatedLists = board.lists.map(list =>
          list.id === sourceListId
            ? { ...list, cards: newCards }
            : list
        )
        toast.success('Card reordered', { id: loadingToast })
      } else {
        // Moving between different lists
        const sourceCards = sourceList.cards.filter(c => c.id !== draggableId)
        const destCards = [...(destList?.cards || [])]
        destCards.splice(destination.index, 0, card)

        updatedLists = board.lists.map(list => {
          if (list.id === sourceListId) {
            return { ...list, cards: sourceCards }
          }
          if (list.id === destListId) {
            return { ...list, cards: destCards }
          }
          return list
        })

        toast.success(`Card moved to ${destList?.title || 'destination list'}`, { id: loadingToast })
      }

      await updateDoc(doc(db, 'boards', sourceBoardId), { lists: updatedLists })
    } catch (error) {
      console.error('Error updating card position:', error)
      toast.error('Failed to move card', { id: loadingToast })
    }
  }, [boards])

  if (loading) {
    return (
      <Layout>
        <div className="p-4 sm:p-6 lg:p-8">
          <SkeletonBoard />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8"
      >
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kanban Boards</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 gap-2 sm:gap-0">
                <p className="text-gray-600 text-sm sm:text-base">Manage your projects and tasks</p>
                {subscription && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.plan === 'free'
                      ? 'bg-gray-100 text-gray-700'
                      : subscription.plan === 'pro'
                      ? 'bg-indigo-100 text-indigo-700'
                      : subscription.plan === 'team'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                  </span>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateBoard}
                disabled={subscriptionLoading || !canCreateBoard(boards.length)}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors w-full sm:w-auto ${
                  !subscriptionLoading && canCreateBoard(boards.length)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus size={20} />
                <span className="text-sm sm:text-base">
                  {subscriptionLoading
                    ? 'Loading...'
                    : canCreateBoard(boards.length)
                    ? 'New Board'
                    : 'Limit Reached'
                  }
                </span>
              </motion.button>
            </motion.div>
          </div>


        </div>

        {/* Usage Indicator for All Plans */}
        {subscription && boards.length > 0 && getPlanLimits().boards !== -1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 border rounded-lg ${
              boards.length >= getPlanLimits().boards
                ? 'bg-red-50 border-red-200'
                : subscription?.plan === 'free'
                ? 'bg-blue-50 border-blue-200'
                : subscription?.plan === 'pro'
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-purple-50 border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${
                  boards.length >= getPlanLimits().boards
                    ? 'text-red-900'
                    : subscription?.plan === 'free'
                    ? 'text-blue-900'
                    : subscription?.plan === 'pro'
                    ? 'text-indigo-900'
                    : 'text-purple-900'
                }`}>
                  Board Usage {boards.length >= getPlanLimits().boards && '- Limit Reached!'}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    subscription?.plan === 'free'
                      ? 'bg-gray-100 text-gray-700'
                      : subscription?.plan === 'pro'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)} Plan
                  </span>
                </h3>
                <p className={`text-sm ${
                  boards.length >= getPlanLimits().boards
                    ? 'text-red-700'
                    : subscription?.plan === 'free'
                    ? 'text-blue-700'
                    : subscription?.plan === 'pro'
                    ? 'text-indigo-700'
                    : 'text-purple-700'
                }`}>
                  {boards.length} of {getPlanLimits().boards} boards used
                </p>
                {boards.length >= getPlanLimits().boards && (
                  <p className="text-red-600 text-xs mt-1">
                    Upgrade to create more boards
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      boards.length >= getPlanLimits().boards ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min((boards.length / getPlanLimits().boards) * 100, 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => setUpgradeModal({ isOpen: true, reason: 'board_limit' })}
                  className={`text-sm font-medium ${
                    boards.length >= getPlanLimits().boards
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {boards.length === 0 ? (
          <EmptyBoardsState onCreateBoard={handleCreateBoard} />
        ) : filteredBoards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boards found</h3>
            <p className="text-gray-500 mb-4">
              No boards match "{searchTerm}". Try adjusting your search.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredBoards.map((board, index) => (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
                    {board.description && (
                      <p className="text-sm text-gray-600 mt-1">{board.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <BoardProgress board={board} />
                    <div className="relative dropdown-container">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setOpenDropdown(openDropdown === board.id ? null : board.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </motion.button>

                      <AnimatePresence>
                        {openDropdown === board.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => deleteBoard(board.id, board.name)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete Board
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
            
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
              {/* Mobile: Horizontal scroll layout */}
              <div className="block lg:hidden">
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {board.lists?.map(list => (
                    <div key={list.id} className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">{list.title}</h4>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addCard(board.id, list.id)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>

                      <Droppable droppableId={`${board.id}-${list.id}`}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-2 min-h-[200px] p-2 rounded-md transition-all duration-200 ${
                              snapshot.isDraggingOver
                                ? 'bg-blue-50 border-2 border-blue-300 border-dashed shadow-inner'
                                : 'border-2 border-transparent'
                            }`}
                          >
                            {(list.cards || []).length === 0 ? (
                              <EmptyListState
                                listName={list.title}
                                onAddCard={() => addCard(board.id, list.id)}
                              />
                            ) : (list.cards || []).map((card, index) => {
                              if (!card.id) return null
                              return (
                                <Draggable key={`${board.id}-${list.id}-${card.id}`} draggableId={card.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-all relative group cursor-pointer ${
                                        snapshot.isDragging
                                          ? 'rotate-2 shadow-2xl scale-105 border-blue-300 bg-blue-50'
                                          : 'hover:border-gray-300'
                                      }`}
                                      onClick={() => handleCardClick(card)}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div {...provided.dragHandleProps} className="flex-1">
                                          <h5 className="font-medium text-gray-900 text-sm leading-tight">{card.title}</h5>
                                        </div>
                                        <div className="flex items-center space-x-1 ml-2">
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                            <GripVertical size={14} className="text-gray-400" />
                                          </div>
                                        </div>
                                      </div>

                                      {card.description && (
                                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{card.description}</p>
                                      )}

                                      <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center space-x-2">
                                          {card.dueDate && (
                                            <div className="flex items-center space-x-1">
                                              <Calendar size={12} />
                                              <span>{new Date(card.dueDate.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                          )}
                                          {card.assignee && (
                                            <div className="flex items-center space-x-1">
                                              <User size={12} />
                                              <span>{card.assignee}</span>
                                            </div>
                                          )}
                                        </div>
                                        {card.attachments?.length > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <PaperClipIcon className="h-3 w-3" />
                                            <span>{card.attachments.length}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                {board.lists?.map(list => (
                  <div key={list.id} className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">{list.title}</h4>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addCard(board.id, list.id)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>
                    
                    <Droppable droppableId={`${board.id}-${list.id}`}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-2 min-h-[200px] p-2 rounded-md transition-all duration-200 ${
                            snapshot.isDraggingOver
                              ? 'bg-blue-50 border-2 border-blue-300 border-dashed shadow-inner'
                              : 'border-2 border-transparent'
                          }`}
                        >
                          {(list.cards || []).length === 0 ? (
                            <EmptyListState
                              listName={list.title}
                              onAddCard={() => addCard(board.id, list.id)}
                            />
                          ) : (list.cards || []).map((card, index) => {
                            if (!card.id) {
                              console.error('Card missing ID:', card)
                              return null
                            }
                            return (
                            <Draggable key={`${board.id}-${list.id}-${card.id}`} draggableId={card.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-all relative group cursor-pointer ${
                                    snapshot.isDragging
                                      ? 'rotate-2 shadow-2xl scale-105 border-blue-300 bg-blue-50'
                                      : 'hover:scale-[1.02]'
                                  }`}
                                  onClick={() => openCardModal(card, board.id, list.id)}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-start space-x-2 flex-1">
                                        <GripVertical size={14} className="text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <h5 className="font-medium text-gray-900 flex-1">{card.title}</h5>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openCardModal(card, board.id, list.id)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 ml-2 p-1 rounded-md hover:bg-gray-100 transition-all"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                    </div>
                                    {card.description && (
                                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                                    )}

                                    {/* Priority Badge */}
                                    {card.priority && (
                                      <div className="mb-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          card.priority === 'high' ? 'bg-red-100 text-red-800' :
                                          card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {card.priority}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <div className="flex items-center space-x-2">
                                        {card.assignee && (
                                          <div className="flex items-center space-x-1">
                                            <User size={12} />
                                            <span>{card.assignee}</span>
                                          </div>
                                        )}
                                        {card.attachments && card.attachments.length > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <PaperClipIcon className="h-3 w-3" />
                                            <span>{card.attachments.length}</span>
                                          </div>
                                        )}
                                      </div>
                                      {card.dueDate && (
                                        <div className="flex items-center space-x-1">
                                          <Calendar size={12} />
                                          <span>{card.dueDate}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                            )
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Card Modal */}
        <CardModal
          isOpen={isCardModalOpen}
          onClose={closeCardModal}
          card={selectedCard}
          onSave={saveCard}
          onDelete={deleteCard}
          boardMembers={[]} // You can add board members here later
        />

        {/* Board Creation Modal */}
        <BoardCreationModal
          isOpen={isBoardModalOpen}
          onClose={() => setIsBoardModalOpen(false)}
          onBoardCreated={handleBoardCreated}
        />

        {/* Drag & Drop Hint */}
        <DragDropHint />

        {/* Dynamic Upgrade Modal */}
        <DynamicUpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={() => setUpgradeModal({ isOpen: false, reason: '' })}
          reason={upgradeModal.reason}
        />
      </motion.div>
    </Layout>
  )
}