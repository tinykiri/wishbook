-- Create the backgrounds storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backgrounds',
  'backgrounds',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backgrounds' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own backgrounds
CREATE POLICY "Users can update their own backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'backgrounds' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own backgrounds
CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backgrounds' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all backgrounds (for share pages)
CREATE POLICY "Public read access for backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'backgrounds');
