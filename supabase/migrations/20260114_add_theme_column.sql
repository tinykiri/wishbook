-- Add theme column to profiles table
-- This stores the user's selected theme ID (e.g., 'default', 'christmas', 'valentine', 'birthday', 'wedding')

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default';

-- Add comment for documentation
COMMENT ON COLUMN profiles.theme IS 'User selected theme ID for wishlist background doodles';
