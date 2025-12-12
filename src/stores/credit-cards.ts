import { create } from 'zustand'
import { getCreditCards, createCreditCard, updateCreditCard as dbUpdateCreditCard, deleteCreditCard as dbDeleteCreditCard } from '@/lib/db'
import type { CreditCard } from '@/types/database'

interface CreditCardsState {
  creditCards: CreditCard[]
  loading: boolean
  fetchCreditCards: () => Promise<void>
  addCreditCard: (creditCard: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCreditCard: (id: string, patch: Partial<Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>
  deleteCreditCard: (id: string) => Promise<void>
}

export const useCreditCardsStore = create<CreditCardsState>((set) => ({
  creditCards: [],
  loading: false,

  fetchCreditCards: async () => {
    set({ loading: true })
    try {
      const data = await getCreditCards()
      set({ creditCards: data })
    } catch (error) {
      console.error('Error fetching credit cards:', error)
    } finally {
      set({ loading: false })
    }
  },

  addCreditCard: async (creditCard) => {
    try {
      const newCreditCard = await createCreditCard(creditCard)
      set((state) => ({ 
        creditCards: [...state.creditCards, newCreditCard] 
      }))
    } catch (error) {
      console.error('Error adding credit card:', error)
      throw error
    }
  }
  ,

  updateCreditCard: async (id, patch) => {
    try {
      const updated = await dbUpdateCreditCard(id, patch)
      set((state) => ({
        creditCards: state.creditCards.map(c => c.id === id ? updated : c)
      }))
    } catch (error) {
      console.error('Error updating credit card:', error)
      throw error
    }
  },

  deleteCreditCard: async (id) => {
    try {
      await dbDeleteCreditCard(id)
      set((state) => ({
        creditCards: state.creditCards.filter(c => c.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting credit card:', error)
      throw error
    }
  }
}))
