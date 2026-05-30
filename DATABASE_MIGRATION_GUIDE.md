# 🗄️ DATABASE MIGRATION GUIDE - Connect Your Supabase

## 📋 Prerequisites

You mentioned you have:
- ✅ Supabase account setup
- ✅ Google Console setup

This guide will help you connect your own Supabase database to this application.

---

## 🚀 STEP 1: Get Your Supabase Credentials

### 1.1 Login to Supabase
1. Go to https://supabase.com
2. Login to your account
3. Select your project (or create a new one)

### 1.2 Get Project URL and Keys
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** section
3. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**⚠️ IMPORTANT:** Keep these keys secure! Never share them publicly.

---

## 🔧 STEP 2: Update Environment Variables

### 2.1 Create/Update `.env` file

In your project root directory, create or update the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**Replace:**
- `https://your-project-id.supabase.co` with your actual Project URL
- `your-anon-key-here` with your actual anon/public key
- `your-service-role-key-here` with your actual service_role key

### 2.2 Example `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQzMjAwMCwiZXhwIjoxOTMxOTkyMDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2NDMyMDAwLCJleHAiOjE5MzE5OTIwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📊 STEP 3: Run Database Migrations

### 3.1 Access Supabase SQL Editor
1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**

### 3.2 Run the Complete Migration Script

Copy and paste the following SQL script into the SQL Editor and click **Run**:

```sql
-- ============================================
-- PREDATOR E-SPORTS DATABASE SCHEMA
-- Complete Migration Script
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  game_name TEXT,
  uid TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entry_fee INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL CHECK (mode IN ('Solo', 'Duo', 'Squad')),
  prize_1st INTEGER NOT NULL DEFAULT 0,
  prize_2nd INTEGER NOT NULL DEFAULT 0,
  prize_3rd INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  room_id TEXT,
  room_password TEXT,
  max_slots INTEGER NOT NULL DEFAULT 100,
  filled_slots INTEGER NOT NULL DEFAULT 0,
  start_date TEXT,
  start_time TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  thumbnail_url TEXT,
  youtube_link TEXT,
  instagram_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. TOURNAMENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  username TEXT,
  phone TEXT,
  gamer_id TEXT,
  in_game_name TEXT,
  slot_number INTEGER,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  eliminated BOOLEAN NOT NULL DEFAULT false,
  winner_position INTEGER CHECK (winner_position IN (1, 2, 3)),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tournament_id)
);

-- ============================================
-- 4. TOURNAMENT RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  first_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  second_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  third_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id)
);

-- ============================================
-- 5. SUPPORT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. PAYMENT SETTINGS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_datetime ON public.tournaments(start_datetime);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_eliminated ON public.tournament_registrations(eliminated);
CREATE INDEX IF NOT EXISTS idx_registrations_gamer_id ON public.tournament_registrations(gamer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_in_game_name ON public.tournament_registrations(in_game_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tournaments Policies
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update tournaments" ON public.tournaments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete tournaments" ON public.tournaments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tournament Registrations Policies
CREATE POLICY "Users can view own registrations" ON public.tournament_registrations
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own registrations" ON public.tournament_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update registrations" ON public.tournament_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete registrations" ON public.tournament_registrations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tournament Results Policies
CREATE POLICY "Results are viewable by everyone" ON public.tournament_results
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage results" ON public.tournament_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Support Messages Policies
CREATE POLICY "Anyone can insert support messages" ON public.support_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view support messages" ON public.support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update support messages" ON public.support_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin Settings Policies
CREATE POLICY "Settings are viewable by everyone" ON public.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payment Settings Policies
CREATE POLICY "Payment settings are viewable by everyone" ON public.payment_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage payment settings" ON public.payment_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for payment screenshots
CREATE POLICY "Anyone can upload payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Anyone can view payment screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Only admins can delete payment screenshots" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'payment-screenshots' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default admin settings
INSERT INTO public.admin_settings (whatsapp_number, instagram_url, youtube_url)
VALUES ('9409929696', 'https://instagram.com/predator_esports', 'https://youtube.com/@predator_esports')
ON CONFLICT DO NOTHING;

-- Insert default payment settings
INSERT INTO public.payment_settings (upi_id, receiver_name)
VALUES ('9409929696@fam', 'Predator E-Sports')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
```

### 3.3 Verify Migration Success

After running the script, you should see:
- ✅ "Success. No rows returned"
- ✅ All tables created
- ✅ All policies applied
- ✅ Storage bucket created

---

## 🔐 STEP 4: Configure Supabase Authentication

### 4.1 Enable Email Authentication
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### 4.2 Configure Site URL
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`

### 4.3 Add Redirect URLs
Add these redirect URLs:
- `http://localhost:5173/**`
- `https://your-domain.com/**`

---

## 👤 STEP 5: Create Admin Account

### 5.1 Register First User
1. Open your application
2. Go to Register page
3. Create an account with your email and password

### 5.2 Make User Admin
1. Go to Supabase dashboard
2. Click on **Table Editor** → **profiles**
3. Find your user record
4. Change `role` from `user` to `admin`
5. Click **Save**

Now you can access admin panel at `/admin/login`

---

## 🎨 STEP 6: Configure Application Settings

### 6.1 Update Payment Settings
1. Login as admin
2. Go to `/admin/payment-settings`
3. Update UPI ID and Receiver Name
4. Click Save

### 6.2 Update Admin Settings
1. Go to `/admin/settings`
2. Update WhatsApp number, Instagram URL, YouTube URL
3. Click Save

---

## 🚀 STEP 7: Deploy to Vercel (Optional)

### 7.1 Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure environment variables

### 7.2 Add Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add these variables:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

### 7.3 Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Your app is live!

---

## 🔍 STEP 8: Verify Everything Works

### 8.1 Test User Features
- ✅ Register new account
- ✅ Login
- ✅ View tournaments
- ✅ Join tournament
- ✅ Upload payment screenshot
- ✅ View registration status

### 8.2 Test Admin Features
- ✅ Login as admin
- ✅ Create tournament
- ✅ Approve/reject registrations
- ✅ Live control (eliminate players, set winners)
- ✅ Update settings

---

## ❓ TROUBLESHOOTING

### Issue: "Failed to fetch"
**Solution:** Check if Supabase URL and keys are correct in `.env` file

### Issue: "RLS policy violation"
**Solution:** Make sure RLS policies are applied correctly. Re-run the migration script.

### Issue: "Storage bucket not found"
**Solution:** 
1. Go to Supabase dashboard → Storage
2. Create bucket named `payment-screenshots`
3. Make it public

### Issue: "Cannot login as admin"
**Solution:** 
1. Go to Supabase dashboard → Table Editor → profiles
2. Find your user
3. Change `role` to `admin`

---

## 📞 SUPPORT

If you encounter any issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors (F12)
3. Verify all environment variables are set correctly
4. Make sure all tables and policies are created

---

## 🎉 CONGRATULATIONS!

Your database is now connected and ready to use! 🚀

**Next Steps:**
1. Create your first tournament
2. Test the registration flow
3. Invite users to join
4. Start your e-sports platform!

---

## 📝 IMPORTANT NOTES

1. **Security:**
   - Never commit `.env` file to Git
   - Keep service_role key secure
   - Use environment variables for sensitive data

2. **Backup:**
   - Regularly backup your Supabase database
   - Export data periodically

3. **Monitoring:**
   - Monitor Supabase usage
   - Check for errors in logs
   - Keep track of storage usage

---

## 🔄 UPDATING DATABASE SCHEMA

If you need to add new features in the future:

1. Go to Supabase SQL Editor
2. Write your migration SQL
3. Run the script
4. Update TypeScript types in `src/types/database.ts`
5. Update services in `src/services/`

---

**That's it! Your Predator E-Sports platform is now connected to your own Supabase database!** 🎮🏆
