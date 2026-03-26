-- 1. Reset all users currently catching a 25 or more tokens to 10
UPDATE public.profiles 
SET credits = 10, max_credits = 10 
WHERE subscription_tier = 'free' AND (credits = 25 OR max_credits = 25);

-- 2. Update table defaults so NEW users always start with 10 tokens
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 10;
ALTER TABLE public.profiles ALTER COLUMN max_credits SET DEFAULT 10;

-- 3. Ensure the authenticated role has permissions to read their profile (to fix 0 tokens display)
CREATE POLICY "Users can read their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Enable service role to bypass RLS (if not already enabled)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
GRANT ALL ON public.profiles TO service_role;
