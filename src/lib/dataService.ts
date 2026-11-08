import { supabase, isSupabaseConfigured } from './supabase';
import {
  Project,
  ProjectModule,
  Task,
  Habit,
  HabitLog,
  ProjectMember,
  ModuleKey,
} from '@/types/database';

// Local storage keys for offline/demo mode
const STORAGE_KEYS = {
  PROJECTS: 'trackspace_demo_projects',
  MODULES: 'trackspace_demo_modules',
  TASKS: 'trackspace_demo_tasks',
  HABITS: 'trackspace_demo_habits',
  HABIT_LOGS: 'trackspace_demo_habit_logs',
  MEMBERS: 'trackspace_demo_members',
};

// Seed demo data
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    owner_id: '00000000-0000-0000-0000-000000000001',
    name: 'Farmasi AI Research',
    description: 'Riset penerapan AI dalam formulasi dan interaksi obat',
    icon: 'flask-conical',
    color: '#4F46E5',
    project_type: 'personal',
    archived_at: null,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-002',
    owner_id: '00000000-0000-0000-0000-000000000001',
    name: 'Skripsi & Publikasi',
    description: 'Manajemen bab skripsi dan persiapan submit jurnal',
    icon: 'book-open',
    color: '#0D9488',
    project_type: 'personal',
    archived_at: null,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-003',
    owner_id: '00000000-0000-0000-0000-000000000001',
    name: 'Tim Laboratorium Farmasi',
    description: 'Kolaborasi inventaris reagen dan jadwal uji klinis bersama tim',
    icon: 'users',
    color: '#EA580C',
    project_type: 'shared',
    archived_at: null,
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_MODULES: ProjectModule[] = [
  // Proj 1: All modules
  { id: 'm1-1', project_id: 'proj-001', module_key: 'task_manager', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm1-2', project_id: 'proj-001', module_key: 'habit_tracker', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm1-3', project_id: 'proj-001', module_key: 'calendar', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm1-4', project_id: 'proj-001', module_key: 'reports', is_enabled: true, created_at: '', updated_at: '' },
  // Proj 2: Task + Calendar
  { id: 'm2-1', project_id: 'proj-002', module_key: 'task_manager', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm2-2', project_id: 'proj-002', module_key: 'habit_tracker', is_enabled: false, created_at: '', updated_at: '' },
  { id: 'm2-3', project_id: 'proj-002', module_key: 'calendar', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm2-4', project_id: 'proj-002', module_key: 'reports', is_enabled: true, created_at: '', updated_at: '' },
  // Proj 3: Task + Reports
  { id: 'm3-1', project_id: 'proj-003', module_key: 'task_manager', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm3-2', project_id: 'proj-003', module_key: 'habit_tracker', is_enabled: false, created_at: '', updated_at: '' },
  { id: 'm3-3', project_id: 'proj-003', module_key: 'calendar', is_enabled: true, created_at: '', updated_at: '' },
  { id: 'm3-4', project_id: 'proj-003', module_key: 'reports', is_enabled: true, created_at: '', updated_at: '' },
];

const SEED_TASKS: Task[] = [
  {
    id: 't-1',
    project_id: 'proj-001',
    title: 'Review literatur docking molekuler senyawa turunan flavonoid',
    description: 'Analisis 15 jurnal terindeks Scopus Q1 mengenai binding affinity target reseptor.',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    created_by: '00000000-0000-0000-0000-000000000001',
    completed_at: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    project_id: 'proj-001',
    title: 'Cleaning dataset SMILES senyawa bioaktif',
    description: 'Normalisasi format kanonikal dan hapus duplikasi stereoisomer.',
    status: 'done',
    priority: 'medium',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    created_by: '00000000-0000-0000-0000-000000000001',
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    project_id: 'proj-001',
    title: 'Training baseline model Graph Neural Network (GNN)',
    description: 'Evaluasi metrik RMSE dan R2 pada cross-validation 5-fold.',
    status: 'todo',
    priority: 'high',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    created_by: '00000000-0000-0000-0000-000000000001',
    completed_at: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    project_id: 'proj-002',
    title: 'Revisi Bab 3 Metodologi Penelitian',
    description: 'Konsultasi dengan dosen pembimbing mengenai parameter simulasi.',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    created_by: '00000000-0000-0000-0000-000000000001',
    completed_at: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-5',
    project_id: 'proj-003',
    title: 'Kalibrasi spektrofotometer UV-Vis lab farmasi',
    description: 'Lakukan kalibrasi bulanan dan dokumentasikan logbook.',
    status: 'todo',
    priority: 'low',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    created_by: '00000000-0000-0000-0000-000000000001',
    completed_at: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_HABITS: Habit[] = [
  {
    id: 'h-1',
    project_id: 'proj-001',
    owner_user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Membaca 1 Paper Farmakologi Komputasi',
    description: 'Mencatat insight inti dan metode docking yang digunakan.',
    frequency_type: 'daily',
    schedule_days: [1, 2, 3, 4, 5, 6, 7],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h-2',
    project_id: 'proj-001',
    owner_user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Review & Refactor Kode Model PyTorch',
    description: 'Pembersihan notebook eksperimen setiap akhir pekan.',
    frequency_type: 'weekly',
    schedule_days: [5, 6], // Jumat & Sabtu
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const SEED_HABIT_LOGS: HabitLog[] = [
  {
    id: 'hl-1',
    habit_id: 'h-1',
    project_id: 'proj-001',
    user_id: '00000000-0000-0000-0000-000000000001',
    log_date: yesterdayStr,
    completed: true,
    note: 'Paper J. Chem. Inf. Model 2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'hl-2',
    habit_id: 'h-1',
    project_id: 'proj-001',
    user_id: '00000000-0000-0000-0000-000000000001',
    log_date: todayStr,
    completed: true,
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function loadLocal<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // LocalStorage write failed
  }
}

export const DataService = {
  // PROJECTS
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          modules:project_modules(*),
          members:project_members(role)
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        user_role: p.members?.[0]?.role || 'member',
      }));
    }

    const projects = loadLocal<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    const modules = loadLocal<ProjectModule[]>(STORAGE_KEYS.MODULES, SEED_MODULES);
    return projects
      .filter((p) => !p.archived_at)
      .map((p) => ({
        ...p,
        modules: modules.filter((m) => m.project_id === p.id),
        user_role: 'owner',
      }));
  },

  async getProject(id: string): Promise<Project | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          modules:project_modules(*),
          members:project_members(role)
        `)
        .eq('id', id)
        .single();

      if (error) return null;
      return {
        ...data,
        user_role: data.members?.[0]?.role || 'member',
      };
    }

    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(input: {
    name: string;
    description: string;
    icon: string;
    color: string;
    project_type: 'personal' | 'shared';
    modules: ModuleKey[];
  }): Promise<Project> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.rpc('create_project_with_modules', {
        p_name: input.name,
        p_description: input.description,
        p_icon: input.icon,
        p_color: input.color,
        p_project_type: input.project_type,
        p_modules: input.modules,
      });

      if (error) throw error;
      return this.getProject(data.id) as Promise<Project>;
    }

    const projects = loadLocal<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    const modulesList = loadLocal<ProjectModule[]>(STORAGE_KEYS.MODULES, SEED_MODULES);

    const newProj: Project = {
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      owner_id: '00000000-0000-0000-0000-000000000001',
      name: input.name,
      description: input.description || null,
      icon: input.icon || 'folder',
      color: input.color || '#4F46E5',
      project_type: input.project_type,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_role: 'owner',
    };

    const allKeys: ModuleKey[] = ['task_manager', 'habit_tracker', 'calendar', 'reports'];
    const newModules: ProjectModule[] = allKeys.map((key) => ({
      id: 'mod-' + Math.random().toString(36).substring(2, 9),
      project_id: newProj.id,
      module_key: key,
      is_enabled: input.modules.includes(key),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    projects.unshift(newProj);
    modulesList.push(...newModules);
    saveLocal(STORAGE_KEYS.PROJECTS, projects);
    saveLocal(STORAGE_KEYS.MODULES, modulesList);

    return { ...newProj, modules: newModules };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) throw error;
      return;
    }

    const projects = loadLocal<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    const idx = projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updates, updated_at: new Date().toISOString() };
      saveLocal(STORAGE_KEYS.PROJECTS, projects);
    }
  },

  async toggleModule(projectId: string, moduleKey: ModuleKey, isEnabled: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('project_modules')
        .update({ is_enabled: isEnabled })
        .match({ project_id: projectId, module_key: moduleKey });
      if (error) throw error;
      return;
    }

    const modules = loadLocal<ProjectModule[]>(STORAGE_KEYS.MODULES, SEED_MODULES);
    const mod = modules.find((m) => m.project_id === projectId && m.module_key === moduleKey);
    if (mod) {
      mod.is_enabled = isEnabled;
      mod.updated_at = new Date().toISOString();
      saveLocal(STORAGE_KEYS.MODULES, modules);
    }
  },

  // TASKS
  async getTasks(projectId?: string): Promise<Task[]> {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(id, name, color, icon),
          assignee:task_assignees(profile:profiles(*))
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        assignee: t.assignee?.[0]?.profile || null,
      }));
    }

    const allTasks = loadLocal<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const allProjects = loadLocal<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);

    let filtered = allTasks.filter((t) => !t.archived_at);
    if (projectId) {
      filtered = filtered.filter((t) => t.project_id === projectId);
    }

    return filtered.map((t) => {
      const proj = allProjects.find((p) => p.id === t.project_id);
      return {
        ...t,
        project: proj ? { id: proj.id, name: proj.name, color: proj.color, icon: proj.icon } : undefined,
      };
    });
  },

  async createTask(input: {
    project_id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string | null;
  }): Promise<Task> {
    if (isSupabaseConfigured) {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          created_by: user.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const tasks = loadLocal<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const newTask: Task = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      project_id: input.project_id,
      title: input.title,
      description: input.description || null,
      status: 'todo',
      priority: input.priority,
      due_date: input.due_date || null,
      created_by: '00000000-0000-0000-0000-000000000001',
      completed_at: null,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    saveLocal(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
      return;
    }

    const tasks = loadLocal<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      let completed_at = tasks[idx].completed_at;
      if (updates.status === 'done') {
        completed_at = new Date().toISOString();
      } else if (updates.status) {
        completed_at = null;
      }

      tasks[idx] = {
        ...tasks[idx],
        ...updates,
        completed_at,
        updated_at: new Date().toISOString(),
      };
      saveLocal(STORAGE_KEYS.TASKS, tasks);
    }
  },

  async deleteTask(id: string): Promise<void> {
    return this.updateTask(id, { archived_at: new Date().toISOString() });
  },

  // HABITS
  async getHabits(projectId?: string): Promise<Habit[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('habits').select('*').eq('is_active', true);
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    const habits = loadLocal<Habit[]>(STORAGE_KEYS.HABITS, SEED_HABITS);
    if (projectId) return habits.filter((h) => h.project_id === projectId && h.is_active);
    return habits.filter((h) => h.is_active);
  },

  async createHabit(input: {
    project_id: string;
    name: string;
    description?: string;
    frequency_type: 'daily' | 'weekly';
    schedule_days: number[];
  }): Promise<Habit> {
    if (isSupabaseConfigured) {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...input,
          owner_user_id: user.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const habits = loadLocal<Habit[]>(STORAGE_KEYS.HABITS, SEED_HABITS);
    const newHabit: Habit = {
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      project_id: input.project_id,
      owner_user_id: '00000000-0000-0000-0000-000000000001',
      name: input.name,
      description: input.description || null,
      frequency_type: input.frequency_type,
      schedule_days: input.schedule_days,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    habits.push(newHabit);
    saveLocal(STORAGE_KEYS.HABITS, habits);
    return newHabit;
  },

  async getHabitLogs(projectId?: string): Promise<HabitLog[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('habit_logs').select('*');
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    const logs = loadLocal<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, SEED_HABIT_LOGS);
    if (projectId) return logs.filter((l) => l.project_id === projectId);
    return logs;
  },

  async toggleHabitLog(habitId: string, projectId: string, dateStr: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const { data: user } = await supabase.auth.getUser();
      // Check if log exists
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id, completed')
        .match({ habit_id: habitId, log_date: dateStr })
        .maybeSingle();

      if (existing) {
        const nextCompleted = !existing.completed;
        await supabase
          .from('habit_logs')
          .update({ completed: nextCompleted })
          .eq('id', existing.id);
        return nextCompleted;
      } else {
        await supabase.from('habit_logs').insert({
          habit_id: habitId,
          project_id: projectId,
          user_id: user.user?.id,
          log_date: dateStr,
          completed: true,
        });
        return true;
      }
    }

    const logs = loadLocal<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, SEED_HABIT_LOGS);
    const existingIdx = logs.findIndex((l) => l.habit_id === habitId && l.log_date === dateStr);

    if (existingIdx !== -1) {
      const nextCompleted = !logs[existingIdx].completed;
      logs[existingIdx].completed = nextCompleted;
      logs[existingIdx].updated_at = new Date().toISOString();
      saveLocal(STORAGE_KEYS.HABIT_LOGS, logs);
      return nextCompleted;
    } else {
      const newLog: HabitLog = {
        id: 'hl-' + Math.random().toString(36).substring(2, 9),
        habit_id: habitId,
        project_id: projectId,
        user_id: '00000000-0000-0000-0000-000000000001',
        log_date: dateStr,
        completed: true,
        note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      logs.push(newLog);
      saveLocal(STORAGE_KEYS.HABIT_LOGS, logs);
      return true;
    }
  },
};
