-- EasyTV Supabase Kurulum SQL'i
-- Bu dosyayı Supabase SQL Editor'de çalıştırın

-- 1. Tabloyu oluştur
CREATE TABLE IF NOT EXISTS easytv_user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  services JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS'i aktif et
ALTER TABLE easytv_user_data ENABLE ROW LEVEL SECURITY;

-- 3. Güvenlik politikalarını ekle
CREATE POLICY "Users can view own data" 
  ON easytv_user_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" 
  ON easytv_user_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" 
  ON easytv_user_data FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" 
  ON easytv_user_data FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Index'leri oluştur (performans için)
CREATE INDEX IF NOT EXISTS easytv_user_data_user_id_idx 
  ON easytv_user_data(user_id);

-- 5. Updated_at trigger (otomatik güncelleme)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_easytv_user_data_updated_at 
  BEFORE UPDATE ON easytv_user_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test sorgusu (optional)
-- SELECT * FROM easytv_user_data WHERE user_id = auth.uid();

-- 6. iOS IAP doğrulama kayıtları (server-side audit)
CREATE TABLE IF NOT EXISTS easytv_iap_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  original_transaction_id TEXT,
  product_id TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE easytv_iap_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own iap verifications"
  ON easytv_iap_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own iap verifications"
  ON easytv_iap_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own iap verifications"
  ON easytv_iap_verifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS easytv_iap_verifications_user_id_idx
  ON easytv_iap_verifications(user_id);
