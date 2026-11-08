-- ==============================================================================
-- TrackSpace Database Schema Migration
-- Version: 1.0 (MVP)
-- Generated for Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. CORE TABLES
-- ==============================================================================

-- PROFILES
-- Maps 1:1 to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  color TEXT NOT NULL DEFAULT '#4F46E5',
  project_type TEXT NOT NULL CHECK (project_type IN ('personal', 'shared')),
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_project_name_len CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 100)
);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

-- PROJECT MODULES
CREATE TABLE IF NOT EXISTS public.project_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL CHECK (module_key IN ('task_manager', 'habit_tracker', 'calendar', 'reports')),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_module UNIQUE (project_id, module_key)
);

CREATE TRIGGER update_project_modules_updated_at
  BEFORE UPDATE ON public.project_modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- PROJECT INVITATIONS
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_project_invitations_updated_at
  BEFORE UPDATE ON public.project_invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_task_title_len CHECK (char_length(trim(title)) >= 1 AND char_length(title) <= 160)
);

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatically manage completed_at
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status <> 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_task_status_changed
  BEFORE UPDATE OF status ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- TASK ASSIGNEES
CREATE TABLE IF NOT EXISTS public.task_assignees (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- HABITS
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'weekly')),
  schedule_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- HABIT LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_habit_log UNIQUE (habit_id, log_date)
);

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_project_members_lookup ON public.project_members(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_modules_lookup ON public.project_modules(project_id, module_key);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(project_id, due_date);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_project_user ON public.habits(project_id, owner_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(habit_id, log_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.project_invitations(token_hash);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================

-- Check if user is an active member or owner of the project
CREATE OR REPLACE FUNCTION public.is_project_member(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user has specific roles in the project (e.g. 'owner', 'admin')
CREATE OR REPLACE FUNCTION public.has_project_role(p_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id
      AND user_id = auth.uid()
      AND role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 5. ENABLE RLS ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. RLS POLICIES
-- ==============================================================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- PROJECTS
CREATE POLICY "Users can view projects they are member of"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.is_project_member(id));

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- PROJECT MEMBERS
CREATE POLICY "Members can view other members in their projects"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Project creator can insert initial owner membership"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    public.has_project_role(project_id, ARRAY['owner', 'admin'])
  );

CREATE POLICY "Owners can update member roles"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (public.has_project_role(project_id, ARRAY['owner']))
  WITH CHECK (public.has_project_role(project_id, ARRAY['owner']));

CREATE POLICY "Owners and members themselves can leave/remove membership"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.has_project_role(project_id, ARRAY['owner'])
  );

-- PROJECT MODULES
CREATE POLICY "Project members can view project modules"
  ON public.project_modules FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Owners can insert/configure modules"
  ON public.project_modules FOR INSERT
  TO authenticated
  WITH CHECK (public.has_project_role(project_id, ARRAY['owner']));

CREATE POLICY "Owners can update module status"
  ON public.project_modules FOR UPDATE
  TO authenticated
  USING (public.has_project_role(project_id, ARRAY['owner']))
  WITH CHECK (public.has_project_role(project_id, ARRAY['owner']));

-- PROJECT INVITATIONS
CREATE POLICY "Project admins/owners can view invitations"
  ON public.project_invitations FOR SELECT
  TO authenticated
  USING (public.has_project_role(project_id, ARRAY['owner', 'admin']));

CREATE POLICY "Project admins/owners can create invitations"
  ON public.project_invitations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_project_role(project_id, ARRAY['owner', 'admin']));

CREATE POLICY "Project admins/owners can update/revoke invitations"
  ON public.project_invitations FOR UPDATE
  TO authenticated
  USING (public.has_project_role(project_id, ARRAY['owner', 'admin']));

-- TASKS
CREATE POLICY "Project members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "Project members can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_member(project_id) AND created_by = auth.uid());

CREATE POLICY "Task editors can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.has_project_role(project_id, ARRAY['owner', 'admin']) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = tasks.id AND user_id = auth.uid())
  );

CREATE POLICY "Owners and admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    public.has_project_role(project_id, ARRAY['owner', 'admin']) OR
    created_by = auth.uid()
  );

-- TASK ASSIGNEES
CREATE POLICY "Members can view assignees"
  ON public.task_assignees FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_assignees.task_id AND public.is_project_member(t.project_id)
  ));

CREATE POLICY "Owners and admins can assign tasks"
  ON public.task_assignees FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_assignees.task_id AND public.has_project_role(t.project_id, ARRAY['owner', 'admin'])
  ));

CREATE POLICY "Owners and admins can remove task assignees"
  ON public.task_assignees FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_assignees.task_id AND public.has_project_role(t.project_id, ARRAY['owner', 'admin'])
  ));

-- HABITS
CREATE POLICY "Users can only view their own habits in a project"
  ON public.habits FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid() AND public.is_project_member(project_id));

CREATE POLICY "Users can create habits for themselves"
  ON public.habits FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND public.is_project_member(project_id));

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- HABIT LOGS
CREATE POLICY "Users can view their own habit logs"
  ON public.habit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.is_project_member(project_id));

CREATE POLICY "Users can insert their own habit logs"
  ON public.habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_project_member(project_id));

CREATE POLICY "Users can update their own habit logs"
  ON public.habit_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ACTIVITY LOGS
CREATE POLICY "Project members can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_project_member(project_id));

CREATE POLICY "System/members can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_member(project_id) AND actor_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ==============================================================================
-- 7. ATOMIC RPC FUNCTION: CREATE PROJECT TRANSACTION
-- Ensures project, owner membership, and active modules are created atomically
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_project_with_modules(
  p_name TEXT,
  p_description TEXT,
  p_icon TEXT,
  p_color TEXT,
  p_project_type TEXT,
  p_modules TEXT[]
)
RETURNS JSONB AS $$
DECLARE
  v_project_id UUID;
  v_mod TEXT;
  v_result JSONB;
BEGIN
  -- 1. Validate module count
  IF array_length(p_modules, 1) IS NULL OR array_length(p_modules, 1) = 0 THEN
    RAISE EXCEPTION 'A project must have at least one active module';
  END IF;

  -- 2. Insert project
  INSERT INTO public.projects (owner_id, name, description, icon, color, project_type)
  VALUES (auth.uid(), p_name, p_description, COALESCE(p_icon, 'folder'), COALESCE(p_color, '#4F46E5'), p_project_type)
  RETURNING id INTO v_project_id;

  -- 3. Insert owner membership
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (v_project_id, auth.uid(), 'owner');

  -- 4. Insert module configurations
  FOREACH v_mod IN ARRAY ARRAY['task_manager', 'habit_tracker', 'calendar', 'reports'] LOOP
    INSERT INTO public.project_modules (project_id, module_key, is_enabled)
    VALUES (v_project_id, v_mod, v_mod = ANY(p_modules));
  END LOOP;

  -- 5. Record activity
  INSERT INTO public.activity_logs (project_id, actor_id, entity_type, entity_id, action, metadata)
  VALUES (v_project_id, auth.uid(), 'project', v_project_id, 'created', jsonb_build_object('name', p_name, 'type', p_project_type));

  SELECT jsonb_build_object(
    'id', v_project_id,
    'name', p_name,
    'project_type', p_project_type
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
