import { useAuthStore } from '@/stores/auth'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, BarChart3, CreditCard as CreditCardIcon, PiggyBank, PieChart, Menu, Settings } from 'lucide-react'
import { useState } from 'react'
import PiggyBankLogo from './PiggyBankLogo'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-emerald-600 flex items-center">
              <PiggyBank className="h-5 w-5 text-emerald-600 mr-2" />
              Cofrin
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-emerald-600 flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/credit-cards"
                className="text-gray-600 hover:text-emerald-600 flex items-center space-x-2"
              >
                <CreditCardIcon className="h-4 w-4" />
                <span>Cartões</span>
              </Link>
              <Link
                to="/all-transactions"
                className="text-gray-600 hover:text-emerald-600 flex items-center space-x-2"
              >
                <PieChart className="h-4 w-4" />
                <span>Todos os Gastos</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
            </span>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-emerald-600 p-2 rounded-lg hover:bg-gray-100"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden text-gray-600 hover:text-emerald-600 p-2 rounded-lg hover:bg-gray-100"
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed top-16 inset-x-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link to="/credit-cards" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Cartões</Link>
            <Link to="/all-transactions" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Todos os Gastos</Link>
            <Link to="/settings" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function HeaderSpacer() {
  return <div className="h-16" />
}
