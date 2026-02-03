-- Add personal information fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_country_code TEXT;

-- Add consent tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_agreed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_agreed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_agreed_at TIMESTAMPTZ;

-- Age constraint (13+ years for COPPA/GDPR compliance)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_birthday_age_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_birthday_age_check
      CHECK (birthday IS NULL OR birthday <= CURRENT_DATE - INTERVAL '13 years');
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN users.first_name IS 'User first name collected during onboarding';
COMMENT ON COLUMN users.last_name IS 'User last name collected during onboarding';
COMMENT ON COLUMN users.birthday IS 'User birthday for age verification (must be 13+ years old)';
COMMENT ON COLUMN users.phone_number IS 'User phone number (optional)';
COMMENT ON COLUMN users.phone_country_code IS 'Country code for phone number (e.g., US, GB, PL)';
COMMENT ON COLUMN users.privacy_policy_agreed_at IS 'Timestamp when user agreed to Privacy Policy';
COMMENT ON COLUMN users.tos_agreed_at IS 'Timestamp when user agreed to Terms of Service';
COMMENT ON COLUMN users.marketing_agreed_at IS 'Timestamp when user agreed to marketing communications (optional)';
