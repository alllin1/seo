-- Create blog-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-media',
  'blog-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public can read all blog media
CREATE POLICY "Public can read blog media" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-media');

-- Authenticated users can upload blog media
CREATE POLICY "Authenticated can upload blog media" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media');

-- Authenticated users can update blog media
CREATE POLICY "Authenticated can update blog media" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-media')
  WITH CHECK (bucket_id = 'blog-media');

-- Authenticated users can delete blog media
CREATE POLICY "Authenticated can delete blog media" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-media');

-- Service role has full access (for edge function)
CREATE POLICY "Service role can manage blog media" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'blog-media')
  WITH CHECK (bucket_id = 'blog-media');
