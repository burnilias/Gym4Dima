-- Create coach_payments table to track user payments for coach access
CREATE TABLE coach_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX coach_payments_user_id_idx ON coach_payments(user_id);
CREATE INDEX coach_payments_coach_id_idx ON coach_payments(coach_id);

-- Enable RLS (Row Level Security)
ALTER TABLE coach_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own payments
CREATE POLICY "Users can view their own payments" 
  ON coach_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own payments
CREATE POLICY "Users can insert their own payments" 
  ON coach_payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow admins to view all payments
CREATE POLICY "Admins can view all payments" 
  ON coach_payments 
  FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));
