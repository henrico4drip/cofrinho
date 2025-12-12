-- Set default user_id to auth.uid() to satisfy RLS on insert without explicit user_id
ALTER TABLE credit_cards ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE transactions ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Ensure updates maintain ownership (optional, relies on existing RLS)
-- No change in policies needed; existing WITH CHECK/USING clauses enforce auth.uid() = user_id
