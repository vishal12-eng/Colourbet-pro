
-- Function to get next round number
CREATE OR REPLACE FUNCTION public.nextval_round()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.round_number_seq');
$$;

-- Allow the service role to work with rounds (edge functions use service role)
-- The existing policies only allow admin users, but edge functions need access too
-- Service role bypasses RLS, so this is already handled
