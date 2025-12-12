import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Transaction } from '@/types/database'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useCreditCardsStore } from '@/stores/credit-cards'
import { useCategoryStore } from '@/stores/categories'
import { ArrowLeft, CreditCard as CreditCardIcon, Plus, X } from 'lucide-react'
import { getStatementAndDueMonth, getDueDate } from '@/utils/billing'
import CategoryIcon from '@/components/CategoryIcon'
import { getCategoryConfig } from '@/config/categoryConfig'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { user, checkUser } = useAuthStore()
  const { addTransaction, addMultipleTransactions } = useTransactionsStore()
  const { creditCards, fetchCreditCards, addCreditCard } = useCreditCardsStore()
  const { activeCategories } = useCategoryStore()

  type TransactionForm = {
    vendor: string
    amount: string
    date: string
    payment_method: Transaction['payment_method']
    category: Transaction['category']
    installments: number
    credit_card_id: string
    notes: string
  }

  const [formData, setFormData] = useState<TransactionForm>({
    vendor: '',
    amount: '',
    date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    payment_method: 'pix',
    category: 'other',
    installments: 1,
    credit_card_id: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreditCardModal, setShowCreditCardModal] = useState(false)
  const [newCreditCard, setNewCreditCard] = useState({
    name: '',
    closing_day: 1,
    due_day: 10
  })

  useEffect(() => {
    checkUser()
    fetchCreditCards()
  }, [checkUser, fetchCreditCards])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (formData.payment_method === 'credit_card' && !formData.credit_card_id) {
        setError('Selecione um cartão de crédito')
        setLoading(false)
        return
      }

      const transactionData: any = {
        vendor: formData.vendor,
        amount: parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.payment_method,
        category: formData.category,
        installments: formData.installments,
        installment_number: 1,
        notes: formData.notes || undefined,
        user_id: user!.id
      }

      // Only add credit_card_id if it's not empty
      if (formData.credit_card_id) {
        transactionData.credit_card_id = formData.credit_card_id
      }

      if (formData.installments > 1) {
        const transactions = []
        const installmentAmount = transactionData.amount / formData.installments
        const purchaseId = (crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`

        for (let i = 0; i < formData.installments; i++) {
          const installmentDate = new Date(transactionData.date)
          installmentDate.setMonth(installmentDate.getMonth() + i)
          let statement_month: string | undefined
          let due_month: string | undefined
          let due_date: string | undefined

          if (transactionData.payment_method === 'credit_card') {
            const card = creditCards.find(c => c.id === formData.credit_card_id)
            if (!card) throw new Error('Cartão selecionado não encontrado')
            const m = getStatementAndDueMonth(`${installmentDate.getFullYear()}-${String(installmentDate.getMonth() + 1).padStart(2, '0')}-${String(installmentDate.getDate()).padStart(2, '0')}`, card.closing_day)
            statement_month = m.statement_month
            due_month = m.due_month
            due_date = getDueDate(due_month, card.due_day)
          }

          const installmentData: any = {
            ...transactionData,
            amount: installmentAmount,
            date: `${installmentDate.getFullYear()}-${String(installmentDate.getMonth() + 1).padStart(2, '0')}-${String(installmentDate.getDate()).padStart(2, '0')}`,
            installment_number: i + 1,
            purchase_id: purchaseId
          }

          if (statement_month) installmentData.statement_month = statement_month
          if (due_month) installmentData.due_month = due_month
          if (due_date) installmentData.due_date = due_date

          transactions.push(installmentData)
        }

        await addMultipleTransactions(transactions)
      } else {
        let payload: any = { ...transactionData }

        if (transactionData.payment_method === 'credit_card') {
          const card = creditCards.find(c => c.id === formData.credit_card_id)
          if (!card) throw new Error('Cartão selecionado não encontrado')
          const m = getStatementAndDueMonth(transactionData.date, card.closing_day)
          payload.purchase_id = (crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
          payload.statement_month = m.statement_month
          payload.due_month = m.due_month
          payload.due_date = getDueDate(m.due_month, card.due_day)
        }

        await addTransaction(payload)
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCreditCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user) {
        setError('Você precisa estar autenticado para salvar um cartão.')
        return
      }
      await addCreditCard({
        name: newCreditCard.name,
        closing_day: newCreditCard.closing_day,
        due_day: newCreditCard.due_day,
        user_id: user!.id
      })
      setShowCreditCardModal(false)
      setNewCreditCard({ name: '', closing_day: 1, due_day: 10 })
      await fetchCreditCards()
    } catch (err) {
      console.error('Error adding credit card:', err)
      setError('Falha ao salvar cartão: verifique sua sessão e tente novamente.')
    }
  }

  const paymentMethods = [
    { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
    { value: 'debit_card', label: 'Cartão de Débito', icon: '💳' },
    { value: 'pix', label: 'PIX', icon: '📱' },
    { value: 'cash', label: 'Dinheiro', icon: '💵' },
    { value: 'other', label: 'Outro', icon: '📄' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nova Transação</h1>
          <p className="text-gray-600 mt-2">Registre um novo gasto</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estabelecimento
              </label>
              <input
                type="text"
                required
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="Nome do estabelecimento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categoria</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {activeCategories.map((cat) => {
                const config = getCategoryConfig(cat)
                const isSelected = formData.category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat as Transaction['category'] })}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${isSelected
                      ? 'bg-emerald-50 ring-2 ring-emerald-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <CategoryIcon category={cat} size="sm" />
                    <span className="text-xs mt-2 text-gray-700 text-center">{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const isSelected = formData.payment_method === method.value
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: method.value as Transaction['payment_method'] })}
                    className={`flex items-center p-4 rounded-xl transition-all ${isSelected
                      ? 'bg-emerald-50 ring-2 ring-emerald-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{method.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Credit Card Options */}
            {formData.payment_method === 'credit_card' && (
              <motion.div
                className="mt-5 space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cartão de Crédito
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.credit_card_id}
                      onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    >
                      <option value="">Selecione um cartão</option>
                      {creditCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreditCardModal(true)}
                      className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                  {formData.installments > 1 && formData.amount && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.installments}x de R$ {(parseFloat(formData.amount) / formData.installments).toFixed(2)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
              placeholder="Adicione observações sobre esta transação..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar Transação'}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Credit Card Modal */}
      {showCreditCardModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCreditCardModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Novo Cartão</h3>
              <button
                onClick={() => setShowCreditCardModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddCreditCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  required
                  value={newCreditCard.name}
                  onChange={(e) => setNewCreditCard({ ...newCreditCard, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="Ex: Nubank, Inter..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia de Fechamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={newCreditCard.closing_day}
                    onChange={(e) => setNewCreditCard({ ...newCreditCard, closing_day: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia de Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={newCreditCard.due_day}
                    onChange={(e) => setNewCreditCard({ ...newCreditCard, due_day: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreditCardModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
