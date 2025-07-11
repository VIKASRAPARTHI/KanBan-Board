import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { db } from '../config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import Layout from '../components/Layout'
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react'
import {
  ClockIcon,
  UserGroupIcon,
  FlagIcon,
  StarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'



export default function Analytics() {
  const [boards, setBoards] = useState([])
  const { currentUser } = useAuth()
  const { subscription, hasFeature } = useSubscription()

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'boards'), where('userId', '==', currentUser.uid))
      const r = query(collection(db, 'boards'), where('collaborators', 'array-contains', currentUser.uid))    // controls board changes
    
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const boardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBoards(boardsData)
      })
      return unsubscribe
    }
  }, [currentUser])

  const getStats = () => {
    const totalCards = boards.reduce((acc, board) => 
      acc + (board.lists?.reduce((listAcc, list) => listAcc + (list.cards?.length || 0), 0) || 0), 0)
    
    const completedCards = boards.reduce((acc, board) => 
      acc + (board.lists?.find(list => list.id === 'done')?.cards?.length || 0), 0)
    
    const inProgressCards = boards.reduce((acc, board) => 
      acc + (board.lists?.find(list => list.id === 'inprogress')?.cards?.length || 0), 0)
    
    const todoCards = boards.reduce((acc, board) => 
      acc + (board.lists?.find(list => list.id === 'todo')?.cards?.length || 0), 0)

    return { totalCards, completedCards, inProgressCards, todoCards }
  }

  const stats = getStats()

  const statCards = [
    { title: 'Total Cards', value: stats.totalCards, icon: Users, color: 'bg-blue-500' },
    { title: 'Completed', value: stats.completedCards, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'In Progress', value: stats.inProgressCards, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Completion Rate', value: `${stats.totalCards ? Math.round((stats.completedCards / stats.totalCards) * 100) : 0}%`, icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track your team's performance and progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-2 sm:p-3`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Cards by Board</h3>
            <div className="space-y-4">
              {boards.map(board => (
                <div key={board.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{board.name}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-red-600">Todo: {board.lists?.find(l => l.id === 'todo')?.cards?.length || 0}</span>
                    <span className="text-yellow-600">Progress: {board.lists?.find(l => l.id === 'inprogress')?.cards?.length || 0}</span>
                    <span className="text-green-600">Done: {board.lists?.find(l => l.id === 'done')?.cards?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-red-600">To Do</span>
                <span className="font-bold">{stats.todoCards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600">In Progress</span>
                <span className="font-bold">{stats.inProgressCards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Done</span>
                <span className="font-bold">{stats.completedCards}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Analytics Features */}
        <div className="space-y-8">
          {/* Time Tracking Analytics - Pro Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-indigo-600" />
                <span>Time Tracking Analytics</span>
              </h3>
              {!hasFeature('time_tracking') && (
                <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
                  Pro Feature
                </span>
              )}
            </div>

            {hasFeature('time_tracking') ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24.5h</div>
                  <div className="text-sm text-blue-700">Total Time This Week</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">3.2h</div>
                  <div className="text-sm text-green-700">Average per Task</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-purple-700">Time Efficiency</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Track time spent on tasks and analyze productivity</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            )}
          </motion.div>

          {/* Advanced Team Analytics - Team Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
                <span>Team Performance</span>
              </h3>
              {subscription?.plan !== 'team' && subscription?.plan !== 'enterprise' && (
                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                  Team Feature
                </span>
              )}
            </div>

            {subscription?.plan === 'team' || subscription?.plan === 'enterprise' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Top Performers</h4>
                    <div className="space-y-2">
                      {['John Doe', 'Jane Smith', 'Mike Johnson'].map((name, idx) => (
                        <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{15 - idx * 2} tasks</span>
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Task Distribution</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'John Doe', tasks: 15, color: 'bg-blue-500' },
                        { name: 'Jane Smith', tasks: 13, color: 'bg-green-500' },
                        { name: 'Mike Johnson', tasks: 11, color: 'bg-purple-500' }
                      ].map((member) => (
                        <div key={member.name} className="flex items-center space-x-3">
                          <div className="w-20 text-sm">{member.name}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${member.color} h-2 rounded-full`}
                              style={{ width: `${(member.tasks / 15) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm font-medium">{member.tasks}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Analyze team performance and individual contributions</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Upgrade to Team
                </button>
              </div>
            )}
          </motion.div>

          {/* Priority Analytics - Pro Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <FlagIcon className="h-5 w-5 text-orange-600" />
                <span>Priority Analysis</span>
              </h3>
              {!hasFeature('priority_levels') && (
                <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">
                  Pro Feature
                </span>
              )}
            </div>

            {hasFeature('priority_levels') ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { priority: 'Urgent', count: 3, color: 'bg-red-500', textColor: 'text-red-600' },
                  { priority: 'High', count: 8, color: 'bg-orange-500', textColor: 'text-orange-600' },
                  { priority: 'Medium', count: 15, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                  { priority: 'Low', count: 12, color: 'bg-green-500', textColor: 'text-green-600' }
                ].map((item) => (
                  <div key={item.priority} className="text-center p-4 border rounded-lg">
                    <div className={`w-4 h-4 ${item.color} rounded-full mx-auto mb-2`} />
                    <div className="text-lg font-bold text-gray-900">{item.count}</div>
                    <div className={`text-sm ${item.textColor}`}>{item.priority}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Analyze task priorities and focus areas</p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}