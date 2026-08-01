-- supabase_schema.sql
-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    membership_id TEXT,
    referral_code TEXT NOT NULL UNIQUE,
    membership_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL UNIQUE,
    customer_email TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lead',
    joined_date TIMESTAMP WITH TIME ZONE,
    reward_status TEXT NOT NULL DEFAULT 'none',
    reward_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    reward_value NUMERIC(10, 2) NOT NULL,
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    issued_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'issued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    gym_name TEXT NOT NULL DEFAULT 'Zoro Gym',
    gym_logo TEXT,
    phone TEXT NOT NULL DEFAULT '+919999999999',
    email TEXT NOT NULL DEFAULT 'contact@zorogym.com',
    address TEXT NOT NULL DEFAULT '123 Gym Street, Fitness City',
    social_links JSONB NOT NULL DEFAULT '{"instagram": "", "facebook": ""}',
    
    -- Standee Settings
    standee_headline TEXT NOT NULL DEFAULT 'Bring a Friend.',
    standee_offer TEXT NOT NULL DEFAULT 'Both of You Save ₹500.',
    standee_discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    standee_terms TEXT NOT NULL DEFAULT 'Valid on quarterly and annual memberships.',
    standee_whatsapp_number TEXT NOT NULL DEFAULT '+919999999999',
    primary_color TEXT NOT NULL DEFAULT '#1F6B45',
    landing_image TEXT,
    
    -- Coupon / Referral Settings
    coupon_prefix TEXT NOT NULL DEFAULT 'ZR',
    coupon_number_length INT NOT NULL DEFAULT 4,
    coupon_auto_generation BOOLEAN NOT NULL DEFAULT true,
    coupon_expiry_days INT NOT NULL DEFAULT 30,
    coupon_max_referrals INT NOT NULL DEFAULT 10,
    coupon_reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    coupon_discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    coupon_min_plan TEXT NOT NULL DEFAULT 'quarterly',
    
    referral_terms TEXT NOT NULL DEFAULT 'T&C Apply. Reward eligible after 3 paid months.',
    privacy_policy TEXT NOT NULL DEFAULT 'Your data is safe with us.'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_referral_code ON members(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_customer_phone ON referrals(customer_phone);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Seed initial default settings
INSERT INTO settings (id, gym_name, phone, email, address, standee_headline, standee_offer, standee_discount_amount, standee_terms, standee_whatsapp_number, primary_color, coupon_prefix, coupon_number_length, coupon_auto_generation, coupon_expiry_days, coupon_max_referrals, coupon_reward_amount, coupon_discount_amount, coupon_min_plan, referral_terms, privacy_policy)
VALUES (
    'default', 
    'Zoro Gym', 
    '+919999999999', 
    'contact@zorogym.com', 
    '123 Gym Street, Fitness City', 
    'Bring a Friend.', 
    'Both of You Save ₹500.', 
    500.00, 
    'Valid on quarterly and annual memberships.', 
    '+919999999999', 
    '#1F6B45', 
    'ZR', 
    4, 
    true, 
    30, 
    10, 
    500.00, 
    500.00, 
    'quarterly', 
    'T&C Apply. Reward eligible after 3 paid months.', 
    'Your data is safe with us.'
) ON CONFLICT (id) DO NOTHING;

-- Seed an initial active member for testing
INSERT INTO members (id, name, phone, email, membership_id, referral_code, membership_status)
VALUES (
    '8c4749f7-7b89-4b68-b7a4-84ad1f4a9557',
    'Akshay Kumar',
    '9999999999',
    'akshay@gmail.com',
    'MEM1001',
    'ZR1001',
    'active'
) ON CONFLICT (phone) DO NOTHING;
