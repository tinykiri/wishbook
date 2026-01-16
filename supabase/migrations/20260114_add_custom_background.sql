-- Add custom_background column to profiles table
-- This stores the URL of user's custom background image from Supabase Storage

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_background TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.custom_background IS 'URL to user uploaded custom background image stored in Supabase Storage backgrounds bucket';
