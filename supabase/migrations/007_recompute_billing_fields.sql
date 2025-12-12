-- Recompute statement_month, due_month, and due_date for existing credit card transactions
UPDATE transactions AS t
SET 
  statement_month = (
    (
      date_trunc('month', t.date)
      + CASE WHEN EXTRACT(day FROM t.date) > c.closing_day THEN INTERVAL '1 month' ELSE INTERVAL '0 month' END
    )::date
  ),
  due_month = (
    (
      date_trunc('month', t.date)
      + CASE WHEN EXTRACT(day FROM t.date) > c.closing_day THEN INTERVAL '2 month' ELSE INTERVAL '1 month' END
    )::date
  ),
  due_date = (
    (
      date_trunc('month', t.date)
      + CASE WHEN EXTRACT(day FROM t.date) > c.closing_day THEN INTERVAL '2 month' ELSE INTERVAL '1 month' END
    )::date + (c.due_day - 1)
  )::date
FROM credit_cards AS c
WHERE t.payment_method = 'credit_card'
  AND t.credit_card_id = c.id;
