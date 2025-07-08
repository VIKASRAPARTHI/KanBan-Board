import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import Layout from '../components/Layout'
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react'



export default function Analytics() {
  const [boards, setBoards] = useState([])
  const { currentUser } = useAuth()

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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your team's performance and progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </Layout>
  )
}