export interface Transaction {
  id: string
  vendor: string
  amount: number
  date: string
  payment_method: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'other'
  installments: number
  installment_number: number
  purchase_id?: string
  credit_card_id?: string
  category: 'food' | 'transport' | 'shopping' | 'services' | 'entertainment' | 'health' | 'technology' | 'subscriptions' | 'education' | 'other'
  receipt_url?: string
  notes?: string
  user_id: string
  statement_month?: string
  due_month?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface CreditCard {
  id: string
  name: string
  closing_day: number
  due_day: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}
