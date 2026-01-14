-- Create blog_posts table with SEO fields
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  featured_image_url TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- SEO fields
  meta_description TEXT,
  seo_title TEXT,
  focus_keyword TEXT,
  keywords TEXT[] DEFAULT '{}',
  canonical_url TEXT,
  seo_score INTEGER,
  
  -- Schema markup
  schema_markup JSONB DEFAULT '{}',
  open_graph JSONB DEFAULT '{}',
  twitter_card JSONB DEFAULT '{}',
  
  -- External platform linking
  external_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index on external_id for platform linking
CREATE INDEX IF NOT EXISTS idx_blog_posts_external_id ON public.blog_posts(external_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can manage all posts
CREATE POLICY "Authenticated users can insert posts" ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts" ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts" ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_posts_updated_at();
