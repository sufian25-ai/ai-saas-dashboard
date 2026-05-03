-- =============================================
-- AI SaaS Dashboard — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Chat Sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY "Users can view own sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in own sessions"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own sessions"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own sessions"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- =============================================
-- Auto-create profile on signup (Trigger)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
  ON public.chat_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at 
  ON public.chat_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_session_id 
  ON public.messages(session_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON public.messages(created_at ASC);
