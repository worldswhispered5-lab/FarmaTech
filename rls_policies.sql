-- 1. Enable RLS for all 7 tables
ALTER TABLE ai_medical_advice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_calculation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_history ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for users to manage ONLY their own data
-- ai_medical_advice_history
CREATE POLICY "Users can manage their own ai_medical_advice_history" 
ON ai_medical_advice_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- barcode_history
CREATE POLICY "Users can manage their own barcode_history" 
ON barcode_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- cosmetic_history
CREATE POLICY "Users can manage their own cosmetic_history" 
ON cosmetic_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- dose_calculation_history
CREATE POLICY "Users can manage their own dose_calculation_history" 
ON dose_calculation_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- interaction_history
CREATE POLICY "Users can manage their own interaction_history" 
ON interaction_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- lab_history
CREATE POLICY "Users can manage their own lab_history" 
ON lab_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- prescription_history
CREATE POLICY "Users can manage their own prescription_history" 
ON prescription_history FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);
