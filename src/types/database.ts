export type ProjectType = 'personal' | 'shared';
export type ProjectRole = 'owner' | 'admin' | 'member';
export type ModuleKey = 'task_manager' | 'habit_tracker' | 'calendar' | 'reports';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type HabitFrequency = 'daily' | 'weekly';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  project_type: ProjectType;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  modules?: ProjectModule[];
  members_count?: number;
  user_role?: ProjectRole;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  profile?: Profile;
}

export interface ProjectModule {
  id: string;
  project_id: string;
  module_key: ModuleKey;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: 'admin' | 'member';
  token_hash: string;
  status: InvitationStatus;
  expires_at: string;
  invited_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_by: string;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  assignee?: Profile | null;
}

export interface TaskAssignee {
  task_id: string;
  user_id: string;
  assigned_by: string;
  created_at: string;
  profile?: Profile;
}

export interface Habit {
  id: string;
  project_id: string;
  owner_user_id: string;
  name: string;
  description: string | null;
  frequency_type: HabitFrequency;
  schedule_days: number[]; // 1 = Monday, 7 = Sunday
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  project_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  completed: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile;
}

export interface Notification {
  id: string;
  recipient_id: string;
  project_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}
