-- كود إنشاء جدول المنتجات (Products) المطور في قاعدة بيانات Supabase
-- قم بنسخ هذا الكود بالكامل، ثم الصقه في صفحة (SQL Editor) داخل لوحة تحكم Supabase واضغط على (Run)

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('medicine', 'cosmetic', 'other')),
    origin TEXT,
    description TEXT,
    qr_serial TEXT, -- الباركود أو السيريال نمبر
    benefits TEXT, -- الفوائد
    harms TEXT, -- الأضرار والآثار الجانبية
    interactions TEXT, -- التداخلات الدوائية
    medical_advice TEXT -- نصيحة طبية
);

-- التحديث: إضافة الأعمدة الجديدة في حالة كان الجدول موجوداً مسبقاً من محاولة قديمة
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS qr_serial TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS benefits TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS harms TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS interactions TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS medical_advice TEXT;

-- حذف حقل التوقيت (created_at) إذا كان موجوداً بناءً على طلب المستخدم
ALTER TABLE public.products DROP COLUMN IF EXISTS created_at;

-- إعطاء صلاحيات القراءة للجميع (Public Read Access)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;

CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
USING (true);

-- اختياري: إضافة بيانات تجريبية مطورة
INSERT INTO public.products (name, scientific_name, category, origin, description, qr_serial, benefits, harms, interactions, medical_advice)
VALUES 
(
    'Himalaya Rumalaya Gel', 
    'Mentha arvensis & Pinus zeylanicum', 
    'medicine', 
    'Himalaya - India', 
    'جل أيورفيدي لعلاج آلام المفاصل والعضلات', 
    '8901138501170', 
    'تخفيف آلام المفاصل، وتقليل التصلب، وتحسين الحركة.', 
    'قد يسبب تهيجاً خفيفاً في الجلد لبعض الأشخاص.', 
    'غير معروف تداخلات خطيرة مع الأدوية الفموية.', 
    'يوضع بلطف على المنطقة المصابة 3-4 مرات يومياً.'
),
(
    'Panadol Extra', 
    'Paracetamol + Caffeine', 
    'medicine', 
    'GSK', 
    'مسكن قوي لآلام الصداع النصفي', 
    '5000158102322', 
    'تسكين الآلام المتوسطة إلى الشديدة وخفض الحرارة.', 
    'الأرق (بسبب الكافيين)، اضطراب المعدة في حالات نادرة.', 
    'لا يؤخذ مع أدوية أخرى تحتوي على باراسيتامول لتجنب السمية الكبدية.', 
    'لا تتجاوز 8 أقراص في اليوم الواحد.'
)
ON CONFLICT DO NOTHING;
