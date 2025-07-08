import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children = null }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" />
}