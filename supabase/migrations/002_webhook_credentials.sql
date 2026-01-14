-- Create webhook_credentials table
CREATE TABLE IF NOT EXISTS public.webhook_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on api_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_credentials_api_key ON public.webhook_credentials(api_key);

-- Create index on user_id for user queries
CREATE INDEX IF NOT EXISTS idx_webhook_credentials_user_id ON public.webhook_credentials(user_id);

-- Enable RLS
ALTER TABLE public.webhook_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own credentials
CREATE POLICY "Users can view own credentials" ON public.webhook_credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credentials" ON public.webhook_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" ON public.webhook_credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" ON public.webhook_credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can validate any credential (for edge function)
CREATE POLICY "Service role can read all credentials" ON public.webhook_credentials
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update last_used_at" ON public.webhook_credentials
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
