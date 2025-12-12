export function getStatementAndDueMonth(purchaseDate: string, closing_day: number): { statement_month: string; due_month: string } {
  const base = new Date(purchaseDate)
  const statementMonth = new Date(base.getFullYear(), base.getMonth(), 1)
  if (base.getDate() > closing_day) {
    statementMonth.setMonth(statementMonth.getMonth() + 1)
  }
  const dueMonth = new Date(statementMonth.getFullYear(), statementMonth.getMonth() + 1, 1)
  const smStr = toLocalYYYYMMDD(statementMonth)
  const dmStr = toLocalYYYYMMDD(dueMonth)
  return { statement_month: smStr, due_month: dmStr }
}

export function getDueDate(dueMonthFirstDay: string, due_day: number): string {
  const d = new Date(dueMonthFirstDay)
  const due = new Date(d.getFullYear(), d.getMonth(), Math.min(Math.max(due_day, 1), 31))
  return toLocalYYYYMMDD(due)
}
function toLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
