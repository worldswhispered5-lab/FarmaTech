-- كود إنشاء جدول الملفات الشخصية (Profiles) لإدارة الأرصدة والاشتراكات
-- قم بنسخ هذا الكود ولصقه في (SQL Editor) في Supabase ثم اضغط (Run)

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    credits INTEGER DEFAULT 25,
    subscription_tier TEXT DEFAULT 'free',
    stripe_customer_id TEXT
);

-- ربط الجدول بنظام الهوية ( اختياري إذا كنت تستخدم UUID )
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- تفعيل سياسات الأمان (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدم بقراءة ملفه الشخصي فقط
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (true); -- مسموح للكل للقراءة حالياً للتجربة، يمكن تضييقه لاحقاً

-- السماح بتحديث الملف (مثل الرصيد)
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles" ON public.profiles
    USING (true)
    WITH CHECK (true);

-- ملاحظة: إذا كنت تستخدم API Key العادي (Anon)، يفضل استخدام السياسة التالية:
-- CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
