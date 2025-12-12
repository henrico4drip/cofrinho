import { create } from 'zustand'
import { getUnifiedMonthTransactions, createTransaction, createTransactions, deleteTransaction as dbDeleteTransaction, deleteTransactionsByPurchase, updateTransaction as dbUpdateTransaction, updateTransactionsByPurchase } from '@/lib/db'
import type { Transaction } from '@/types/database'

interface TransactionsState {
  transactions: Transaction[]
  loading: boolean
  fetchTransactions: (startDate: string, endDate: string) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  addMultipleTransactions: (transactions: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  deleteTransactionGroup: (purchaseId: string) => Promise<void>
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  updateTransactionGroup: (purchaseId: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async (startDate: string, endDate: string) => {
    set({ loading: true })
    try {
      const dueMonthFirstDay = startDate
      const data = await getUnifiedMonthTransactions(startDate, endDate, dueMonthFirstDay)
      set({ transactions: data })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      set({ loading: false })
    }
  },

  addTransaction: async (transaction) => {
    try {
      const newTransaction = await createTransaction(transaction)
      set((state) => ({ 
        transactions: [newTransaction, ...state.transactions] 
      }))
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  },

  addMultipleTransactions: async (transactions) => {
    try {
      const newTransactions = await createTransactions(transactions)
      set((state) => ({ 
        transactions: [...newTransactions, ...state.transactions] 
      }))
    } catch (error) {
      console.error('Error adding multiple transactions:', error)
      throw error
    }
  },

  deleteTransaction: async (id) => {
    try {
      await dbDeleteTransaction(id)
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  },

  deleteTransactionGroup: async (purchaseId) => {
    try {
      await deleteTransactionsByPurchase(purchaseId)
      set((state) => ({
        transactions: state.transactions.filter(t => t.purchase_id !== purchaseId)
      }))
    } catch (error) {
      console.error('Error deleting transaction group:', error)
      throw error
    }
  },

  updateTransaction: async (id, patch) => {
    try {
      const updated = await dbUpdateTransaction(id, patch)
      set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? updated : t)
      }))
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  updateTransactionGroup: async (purchaseId, patch) => {
    try {
      const updated = await updateTransactionsByPurchase(purchaseId, patch)
      const updatedMap = new Map(updated.map(u => [u.id, u]))
      set((state) => ({
        transactions: state.transactions.map(t => updatedMap.get(t.id) || t)
      }))
    } catch (error) {
      console.error('Error updating transaction group:', error)
      throw error
    }
  }
}))
