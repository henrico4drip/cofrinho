import { useEffect, useState } from 'react'
import { useCreditCardsStore } from '@/stores/credit-cards'
import { useAuthStore } from '@/stores/auth'
import { Plus, Pencil, Trash } from 'lucide-react'

export default function CreditCards() {
  const { user } = useAuthStore()
  const { creditCards, fetchCreditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useCreditCardsStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', closing_day: 1, due_day: 10 })
  const [error, setError] = useState('')

  useEffect(() => { fetchCreditCards() }, [fetchCreditCards])

  const startCreate = () => {
    setEditingId(null)
    setForm({ name: '', closing_day: 1, due_day: 10 })
    setShowForm(true)
  }

  const startEdit = (id: string) => {
    const card = creditCards.find(c => c.id === id)
    if (!card) return
    setEditingId(id)
    setForm({ name: card.name, closing_day: card.closing_day, due_day: card.due_day })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (!user) {
        setError('Faça login para cadastrar cartões')
        return
      }
      if (editingId) {
        await updateCreditCard(editingId, form)
      } else {
        await addCreditCard({ ...form, user_id: user.id })
      }
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão')
    }
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Excluir este cartão?')
    if (!ok) return
    await deleteCreditCard(id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
        <button onClick={startCreate} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Novo Cartão
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Editar Cartão' : 'Novo Cartão'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fechamento</label>
              <input type="number" min={1} max={31} value={form.closing_day} onChange={e => setForm({ ...form, closing_day: parseInt(e.target.value) || 1 })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vencimento</label>
              <input type="number" min={1} max={31} value={form.due_day} onChange={e => setForm({ ...form, due_day: parseInt(e.target.value) || 1 })} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {creditCards.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.closing_day}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.due_day}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => startEdit(c.id)} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Editar"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded hover:bg-red-50 text-red-600" title="Excluir"><Trash className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
