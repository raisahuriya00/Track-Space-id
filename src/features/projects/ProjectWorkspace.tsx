import React from 'react';
import { useParams, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Calendar,
  BarChart3,
  Settings,
  FolderKanban,
  Users,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? DataService.getProject(projectId) : null),
    enabled: Boolean(projectId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full rounded-card" />
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-900">Project Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Project ini mungkin telah diarsipkan atau Anda tidak memiliki akses ke project ini.
        </p>
      </div>
    );
  }

  const isModuleActive = (key: string) => {
    return project.modules?.some((m) => m.module_key === key && m.is_enabled);
  };

  // Enforce URL module protection: if trying to open an inactive module, redirect to overview
  const currentTab = location.pathname.split('/').pop();
  if (
    (currentTab === 'tasks' && !isModuleActive('task_manager')) ||
    (currentTab === 'habits' && !isModuleActive('habit_tracker')) ||
    (currentTab === 'calendar' && !isModuleActive('calendar')) ||
    (currentTab === 'reports' && !isModuleActive('reports'))
  ) {
    return <Navigate to={`/projects/${projectId}/overview`} replace />;
  }

  const tabs = [
    { label: 'Overview', path: 'overview', icon: LayoutDashboard, enabled: true },
    {
      label: 'Task Manager',
      path: 'tasks',
      icon: CheckSquare,
      enabled: isModuleActive('task_manager'),
    },
    {
      label: 'Habit Tracker',
      path: 'habits',
      icon: Flame,
      enabled: isModuleActive('habit_tracker'),
    },
    {
      label: 'Calendar',
      path: 'calendar',
      icon: Calendar,
      enabled: isModuleActive('calendar'),
    },
    {
      label: 'Progress & Reports',
      path: 'reports',
      icon: BarChart3,
      enabled: isModuleActive('reports'),
    },
    { label: 'Settings', path: 'settings', icon: Settings, enabled: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="bg-white p-6 rounded-card border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: project.color }}
            >
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <Badge
                  variant={project.project_type === 'shared' ? 'info' : 'neutral'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {project.project_type === 'shared' ? (
                    <>
                      <Users className="w-3 h-3" /> Shared Project
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" /> Personal Project
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {project.description || 'Tidak ada deskripsi untuk project ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 mt-6 pt-2 scrollbar-none">
          {tabs
            .filter((t) => t.enabled)
            .map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={`/projects/${projectId}/${tab.path}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </NavLink>
              );
            })}
        </div>
      </div>

      {/* Tab Content */}
      <Outlet context={{ project }} />
    </div>
  );
};
