-- Create credit cards table
CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
    due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_credit_cards_user ON credit_cards(user_id);

-- Enable RLS
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Grant basic access
GRANT SELECT ON credit_cards TO anon;
GRANT ALL PRIVILEGES ON credit_cards TO authenticated;

-- RLS Policies for credit cards
CREATE POLICY "Users can view own credit cards" ON credit_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credit cards" ON credit_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" ON credit_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" ON credit_cards
    FOR DELETE USING (auth.uid() = user_id);