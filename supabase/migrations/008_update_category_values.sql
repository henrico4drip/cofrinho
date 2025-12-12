-- Update category check constraint to include new categories
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.transactions'::regclass
      AND conname = 'transactions_category_check'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_category_check;
  END IF;
END$$;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_category_check
  CHECK (category IN (
    'food','transport','shopping','services','entertainment','health','technology','subscriptions','education','other'
  ));
