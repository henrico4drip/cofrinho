import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTransactionsStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Transaction } from '@/types/database'
import AnimatedPieChart, { type PieSegment } from '@/components/AnimatedPieChart'
import CategoryIcon from '@/components/CategoryIcon'
import { getCategoryConfig } from '@/config/categoryConfig'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export default function AllTransactions() {
  const { user } = useAuthStore()
  const { transactions, fetchTransactions, loading } = useTransactionsStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
  const monthLabel = new Date(currentDate.getFullYear(), currentDate.getMonth()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetchTransactions(monthStart, monthEnd)
  }, [monthStart, monthEnd, fetchTransactions])

  const listRef = useRef<HTMLDivElement | null>(null)

  const totalsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of transactions) {
      const key = t.category || 'other'
      map[key] = (map[key] || 0) + t.amount
    }
    return map
  }, [transactions])

  const grandTotal = useMemo(() => transactions.reduce((s, t) => s + t.amount, 0), [transactions])

  const segments = useMemo((): PieSegment[] => {
    const entries = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])
    let accumulatedAngle = 0

    return entries.map(([cat, value]) => {
      const config = getCategoryConfig(cat)
      const percentage = grandTotal > 0 ? (value / grandTotal) * 100 : 0
      const angleSpan = (percentage / 100) * 360

      const segment: PieSegment = {
        category: cat,
        value,
        percentage,
        color: config.color,
        startAngle: accumulatedAngle,
        endAngle: accumulatedAngle + angleSpan
      }

      accumulatedAngle += angleSpan
      return segment
    })
  }, [totalsByCategory, grandTotal])

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1))
    setCurrentDate(d)
  }

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0e3b34' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">Todos os seus Gastos</h1>
          <p className="text-sm mt-1 opacity-80">
            Atualizado até: {new Date().toLocaleDateString('pt-BR')} – {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </motion.div>

        {/* Month Selector - New pill design */}
        <motion.div
          className="flex items-center justify-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-full px-6 py-3 flex items-center gap-4 shadow-lg">
            <button
              onClick={() => navigateMonth('prev')}
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-gray-900 font-medium capitalize min-w-[200px] text-center">
              {monthLabel}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Animated Pie Chart */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatedPieChart
            segments={segments}
            total={grandTotal}
            onViewTransactions={scrollToList}
          />
        </motion.div>

        {/* Category List - New design */}
        <motion.div
          className="space-y-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {segments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
              Nenhuma transação neste mês.
            </div>
          ) : (
            segments.map((segment, index) => {
              const config = getCategoryConfig(segment.category)
              return (
                <motion.div
                  key={segment.category}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                >
                  <CategoryIcon category={segment.category} size="md" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.percentage.toFixed(0)}% | {formatCurrency(segment.value)}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Transactions List */}
        <motion.div
          ref={listRef}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transações do mês</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-500">Carregando…</div>
            ) : transactions.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-500">Nenhuma transação encontrada.</div>
            ) : (
              transactions.map((t: Transaction, index) => (
                <motion.div
                  key={t.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.7 + index * 0.02 }}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={t.category || 'other'} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.vendor}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {new Date(t.date).toLocaleDateString('pt-BR')} · {t.payment_method === 'credit_card' ? 'Crédito' : t.payment_method === 'debit_card' ? 'Débito' : t.payment_method.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(t.amount)}</div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
