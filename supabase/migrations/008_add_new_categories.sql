-- Add new categories to the CHECK constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_check;

ALTER TABLE transactions ADD CONSTRAINT transactions_category_check 
CHECK (category IN ('food', 'transport', 'shopping', 'services', 'entertainment', 'health', 'technology', 'subscriptions', 'education', 'other'));
