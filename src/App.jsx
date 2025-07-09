import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import LandingPage from './pages/LandingPage'
import PlanSelection from './pages/PlanSelection'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import SubscriptionPage from './pages/SubscriptionPage'
import BillingPage from './pages/BillingPage'
import ProtectedRoute from './components/ProtectedRoute'
import SubscriptionGate from './components/SubscriptionGate'
import ToastProvider from './components/ToastProvider'

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/plans" element={
                <ProtectedRoute>
                  <PlanSelection />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/subscribe/:plan" element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastProvider />
          </div>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App