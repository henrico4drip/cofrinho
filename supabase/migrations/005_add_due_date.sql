-- Add exact due date for credit card transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_date DATE;

-- Index to accelerate queries by user and due_date
CREATE INDEX IF NOT EXISTS idx_transactions_user_due_date ON transactions(user_id, due_date);
