import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Transaction } from '@/types/database'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useCreditCardsStore } from '@/stores/credit-cards'
import { useCategoryStore } from '@/stores/categories'
import { getCreditCardChargesByDueMonth } from '@/lib/db'
import { Link } from 'react-router-dom'
import { Wallet, CreditCard, TrendingDown, Plus, ChevronLeft, ChevronRight, Trash, Pencil, X } from 'lucide-react'
import CategoryIcon from '@/components/CategoryIcon'
import { getCategoryConfig } from '@/config/categoryConfig'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { transactions, fetchTransactions, deleteTransaction, deleteTransactionGroup, updateTransaction, updateTransactionGroup } = useTransactionsStore()
  const { fetchCreditCards } = useCreditCardsStore()
  const { activeCategories } = useCategoryStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthTotal, setMonthTotal] = useState(0)
  const [creditCardTotal, setCreditCardTotal] = useState(0)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<Transaction | null>(null)
  const [editFor, setEditFor] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState({ vendor: '', amount: '', category: 'other' as Transaction['category'], notes: '', date: '' })

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
  const dueMonthFirstDay = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]

  useEffect(() => {
    fetchTransactions(startOfMonth, endOfMonth)
    fetchCreditCards()
  }, [currentDate, fetchTransactions, fetchCreditCards, startOfMonth, endOfMonth])

  useEffect(() => {
    // Calculate month total
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    setMonthTotal(total)

      // Calculate credit card total for current month
      ; (async () => {
        try {
          const ccCharges = await getCreditCardChargesByDueMonth(dueMonthFirstDay)
          const creditTotal = ccCharges.reduce((sum, t) => sum + t.amount, 0)
          setCreditCardTotal(creditTotal)
        } catch {
          setCreditCardTotal(0)
        }
      })()

    // Get last transaction
    if (transactions.length > 0) {
      setLastTransaction(transactions[0])
    }
  }, [transactions, startOfMonth, endOfMonth])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1)
    } else {
      newDate.setMonth(currentMonth + 1)
    }
    setCurrentDate(newDate)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }



  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600">Aqui está um resumo dos seus gastos</p>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 mt-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900">
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </h2>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total do Mês</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cartão de Crédito</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(creditCardTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Última Compra</p>
                {lastTransaction ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(lastTransaction.amount)}</p>
                    <p className="text-sm text-gray-500 truncate">{lastTransaction.vendor}</p>
                    <p className="text-xs text-gray-400">{formatDate(lastTransaction.date)}</p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-400">Nenhuma compra</p>
                )}
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transactions List */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transações do Mês</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-2">Nenhuma transação encontrada para este mês.</p>
                <Link
                  to="/add-transaction"
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-block"
                >
                  Adicionar sua primeira transação
                </Link>
              </div>
            ) : (
              transactions.map((transaction) => {
                const categoryConfig = getCategoryConfig(transaction.category)
                return (
                  <motion.div
                    key={transaction.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <CategoryIcon category={transaction.category} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{transaction.vendor}</h4>
                            <span className="text-sm font-semibold text-gray-900 ml-4">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                              {categoryConfig.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {transaction.payment_method === 'credit_card'
                                ? `Cartão • fatura ${formatMonthYear(transaction.due_month || transaction.date)} • vence ${formatDate(transaction.due_date || transaction.date)}`
                                : transaction.payment_method === 'pix' ? 'PIX'
                                  : transaction.payment_method === 'debit_card' ? 'Débito'
                                    : transaction.payment_method === 'cash' ? 'Dinheiro'
                                      : 'Outro'}
                            </span>
                            {transaction.installments > 1 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                                {transaction.installment_number}/{transaction.installments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditFor(transaction)
                            setEditForm({ vendor: transaction.vendor, amount: String(transaction.amount), category: transaction.category, notes: transaction.notes || '', date: transaction.date })
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-emerald-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteFor(transaction)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
        {/* Mobile Action Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 p-3">
          <div className="max-w-7xl mx-auto px-2 flex items-center justify-between gap-3">
            <Link
              to="/all-transactions"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 text-center font-medium hover:bg-emerald-50"
            >
              Todos os Gastos
            </Link>
            <Link
              to="/add-transaction"
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white text-center font-medium hover:bg-emerald-700"
            >
              Nova Transação
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {confirmDeleteFor && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setConfirmDeleteFor(null)}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Excluir transação</h3>
              <button
                onClick={() => setConfirmDeleteFor(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Escolha o que deseja excluir. Esta ação não pode ser desfeita.</p>
            <div className="space-y-3">
              <button
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                onClick={async () => {
                  await deleteTransaction(confirmDeleteFor.id)
                  setConfirmDeleteFor(null)
                }}
              >
                Excluir apenas esta parcela
              </button>
              {confirmDeleteFor.installments > 1 && confirmDeleteFor.purchase_id && (
                <button
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  onClick={async () => {
                    await deleteTransactionGroup(confirmDeleteFor.purchase_id!)
                    setConfirmDeleteFor(null)
                  }}
                >
                  Excluir todas as parcelas desta compra
                </button>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setConfirmDeleteFor(null)}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {editFor && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setEditFor(null)}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Editar transação</h3>
              <button
                onClick={() => setEditFor(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estabelecimento</label>
                <input
                  value={editForm.vendor}
                  onChange={e => setEditForm({ ...editForm, vendor: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="Nome do estabelecimento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Categoria</label>
                <div className="grid grid-cols-4 gap-2">
                  {activeCategories.map((cat) => {
                    const config = getCategoryConfig(cat)
                    const isSelected = editForm.category === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, category: cat as Transaction['category'] })}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${isSelected
                          ? 'bg-emerald-50 ring-2 ring-emerald-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                      >
                        <CategoryIcon category={cat} size="sm" />
                        <span className="text-xs mt-1 text-gray-700 text-center">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                  placeholder="Adicione observações..."
                />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                onClick={async () => {
                  const patch: any = { vendor: editForm.vendor, amount: parseFloat(editForm.amount || '0'), category: editForm.category, notes: editForm.notes, date: editForm.date }
                  await updateTransaction(editFor.id, patch)
                  setEditFor(null)
                }}
              >
                Salvar apenas esta parcela
              </button>
              {editFor.installments > 1 && editFor.purchase_id && (
                <button
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  onClick={async () => {
                    const patch: any = { vendor: editForm.vendor, amount: parseFloat(editForm.amount || '0'), category: editForm.category, notes: editForm.notes }
                    await updateTransactionGroup(editFor.purchase_id!, patch)
                    setEditFor(null)
                  }}
                >
                  Salvar todas as parcelas desta compra
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setEditFor(null)}
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
