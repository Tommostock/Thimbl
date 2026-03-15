-- ============================================
-- Thimbl Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor to create all tables.
-- After creating tables, run seed.sql to populate projects & achievements.

-- ============================================
-- 1. Profiles — extends Supabase auth.users
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  favourite_category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. Projects — the 30+ craft project catalogue
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT,
  cover_image TEXT,
  materials JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  tips TEXT,
  cost_estimate TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. User Projects — tracks a user's started/completed projects
-- ============================================
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  hours_logged NUMERIC(6,1) DEFAULT 0,
  notes TEXT,
  UNIQUE(user_id, project_id)
);

-- ============================================
-- 4. User Photos — photos uploaded per project
-- ============================================
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  category TEXT DEFAULT 'during' CHECK (category IN ('before', 'during', 'after')),
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. Shopping List Items
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity TEXT,
  is_checked BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. Achievements — definitions (seeded)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 25,
  criteria JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- 7. User Achievements — unlocked achievements per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 8. User Stats — denormalised for dashboard performance
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Profiles: users can read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: publicly readable (no auth required to browse catalogue)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are publicly readable" ON projects FOR SELECT USING (true);

-- User Projects: users can only access their own
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own projects" ON user_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON user_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON user_projects FOR DELETE USING (auth.uid() = user_id);

-- User Photos: users can only access their own
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own photos" ON user_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own photos" ON user_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own photos" ON user_photos FOR DELETE USING (auth.uid() = user_id);

-- Shopping List: users can only access their own
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own shopping items" ON shopping_list_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own shopping items" ON shopping_list_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own shopping items" ON shopping_list_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own shopping items" ON shopping_list_items FOR DELETE USING (auth.uid() = user_id);

-- Achievements: publicly readable
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are publicly readable" ON achievements FOR SELECT USING (true);

-- User Achievements: users can only access their own
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Stats: users can only access their own
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Auto-create profile & stats on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');

  INSERT INTO user_stats (user_id, total_xp, level, current_streak, longest_streak)
  VALUES (NEW.id, 0, 1, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires after a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
