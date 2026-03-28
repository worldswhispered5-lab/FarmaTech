-- Create alternative_history table
CREATE TABLE IF NOT EXISTS alternative_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    parsed_data JSONB
);

-- Enable RLS
ALTER TABLE alternative_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to be safe)
DROP POLICY IF EXISTS "Users can view their own alternative_history" ON alternative_history;
DROP POLICY IF EXISTS "Users can insert their own alternative_history" ON alternative_history;
DROP POLICY IF EXISTS "Users can update their own alternative_history" ON alternative_history;
DROP POLICY IF EXISTS "Users can delete their own alternative_history" ON alternative_history;

-- Create policies ensuring users only access their own alternative history
CREATE POLICY "Users can view their own alternative_history" 
ON alternative_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alternative_history" 
ON alternative_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alternative_history" 
ON alternative_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alternative_history" 
ON alternative_history FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS alternative_history_user_id_idx ON alternative_history(user_id);
CREATE INDEX IF NOT EXISTS alternative_history_image_hash_idx ON alternative_history(image_hash);
