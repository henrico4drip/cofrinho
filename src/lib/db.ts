import { supabase } from './supabase'
import type { Transaction, CreditCard } from '@/types/database'

// Transaction operations
export async function getTransactions(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .limit(100)

  if (error) throw error
  return data as Transaction[]
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function createTransactions(transactions: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select()

  if (error) throw error
  return data as Transaction[]
}

// Credit Card operations
export async function getCreditCards() {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('name')

  if (error) throw error
  return data as CreditCard[]
}

export async function createCreditCard(creditCard: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('credit_cards')
    .insert(creditCard)
    .select()
    .single()

  if (error) throw error
  return data as CreditCard
}

export async function updateCreditCard(id: string, patch: Partial<Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('credit_cards')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as CreditCard
}

export async function deleteCreditCard(id: string) {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getCreditCardChargesByDueMonth(dueMonthFirstDay: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_method', 'credit_card')
    .eq('due_month', dueMonthFirstDay)
    .order('date', { ascending: false })

  if (error) throw error
  return data as Transaction[]
}

export async function getUnifiedMonthTransactions(startDate: string, endDate: string, dueMonthFirstDay: string) {
  const [nonCardRes, cardRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .neq('payment_method', 'credit_card')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false }),
    supabase
      .from('transactions')
      .select('*')
      .eq('payment_method', 'credit_card')
      .eq('due_month', dueMonthFirstDay)
      .order('date', { ascending: false })
  ])

  if (nonCardRes.error) throw nonCardRes.error
  if (cardRes.error) throw cardRes.error

  const data = ([...(nonCardRes.data || []), ...(cardRes.data || [])] as Transaction[])
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function deleteTransactionsByPurchase(purchaseId: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('purchase_id', purchaseId)

  if (error) throw error
}

export async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Transaction
}

export async function updateTransactionsByPurchase(purchaseId: string, patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('purchase_id', purchaseId)
    .select()

  if (error) throw error
  return data as Transaction[]
}
