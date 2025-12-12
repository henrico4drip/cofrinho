-- Add statement_month and due_month to transactions for credit card billing cycles
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS statement_month DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_month DATE;

-- Index to speed up queries by user and due_month
CREATE INDEX IF NOT EXISTS idx_transactions_user_due_month ON transactions(user_id, due_month);
