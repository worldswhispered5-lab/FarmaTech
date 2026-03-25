-- كود إنشاء جدول الملفات الشخصية (Profiles) لإدارة الرصيد والاشتراكات
-- يتم ربط هذا الجدول تلقائياً بجدول المستخدمين في Supabase Auth

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    credits INTEGER DEFAULT 25,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprises')),
    stripe_customer_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- تفعيل خاصية الحماية (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدم بقراءة ملفه الشخصي فقط
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- السماح للمستخدم بتحديث ملفه الشخصي (اختياري، في الغالب يتم من خلال السيرفر)
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- وظيفة تلقائية لإنشاء ملف شخصي عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (new.id, new.email, 25);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تفعيل الزناد (Trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
