import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header, { HeaderSpacer } from '@/components/Header'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import AddTransaction from '@/pages/AddTransaction'
import CreditCards from '@/pages/CreditCards'
import AllTransactions from '@/pages/AllTransactions'
import Settings from '@/pages/Settings'

function AppContent() {
  const { checkUser } = useAuthStore()

  useEffect(() => {
    checkUser()
  }, [checkUser])

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/add-transaction" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <AddTransaction />
          </ProtectedRoute>
        } />
        <Route path="/credit-cards" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <CreditCards />
          </ProtectedRoute>
        } />
        <Route path="/all-transactions" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <AllTransactions />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Header />
            <HeaderSpacer />
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
