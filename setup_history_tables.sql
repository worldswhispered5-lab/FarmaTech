-- 0. Enable pgvector extension (Required for AI embeddings like similarity matching)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create the new specialized history tables
-- Each table mirrors the exact structure of the original history table

CREATE TABLE IF NOT EXISTS ai_medical_advice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS barcode_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cosmetic_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dose_calculation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    type TEXT,
    content TEXT,
    image TEXT,
    image_hash TEXT,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Indexes for faster querying on user_id and image_hash
CREATE INDEX IF NOT EXISTS idx_ai_med_user ON ai_medical_advice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_user ON barcode_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmetic_user ON cosmetic_history(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_user ON dose_calculation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_user ON interaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_user ON lab_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_user ON prescription_history(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_med_hash ON ai_medical_advice_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_barcode_hash ON barcode_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_cosmetic_hash ON cosmetic_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_dose_hash ON dose_calculation_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_interaction_hash ON interaction_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_lab_hash ON lab_history(image_hash);
CREATE INDEX IF NOT EXISTS idx_prescription_hash ON prescription_history(image_hash);

-- 3. (Optional) Migrate Data from the old 'history' table if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'history') THEN
    INSERT INTO prescription_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'prescription';
    
    INSERT INTO lab_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'lab';
    
    INSERT INTO barcode_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'medicine';
    
    INSERT INTO dose_calculation_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'calculation';
    
    INSERT INTO interaction_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'interaction';
    
    INSERT INTO cosmetic_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type = 'cosmetic';
    
    INSERT INTO ai_medical_advice_history (id, user_id, title, type, content, image, image_hash, embedding, created_at)
    SELECT id, user_id, title, type, content, image, NULL, NULL, created_at FROM history WHERE type NOT IN ('prescription', 'lab', 'medicine', 'calculation', 'interaction', 'cosmetic');
  END IF;
END $$;
