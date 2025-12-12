-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'cash', 'other')),
    installments INTEGER DEFAULT 1,
    installment_number INTEGER DEFAULT 1,
    credit_card_id UUID REFERENCES credit_cards(id),
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('food', 'transport', 'shopping', 'services', 'entertainment', 'health', 'other')),
    receipt_url TEXT,
    notes TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_credit_card ON transactions(credit_card_id);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Grant basic access
GRANT SELECT ON transactions TO anon;
GRANT ALL PRIVILEGES ON transactions TO authenticated;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);