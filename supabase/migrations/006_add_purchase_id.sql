-- Add purchase_id to group installments of the same purchase
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS purchase_id UUID;

-- Index for grouping and user queries
CREATE INDEX IF NOT EXISTS idx_transactions_purchase ON transactions(purchase_id);
