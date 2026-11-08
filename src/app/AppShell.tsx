import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar as CalendarIcon,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';

export const AppShell: React.FC = () => {
  const { profile, signOut, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => DataService.getProjects(),
  });

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'My Projects', icon: FolderKanban, path: '/projects' },
    { label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Calendar', icon: CalendarIcon, path: '/calendar' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        )}
      >
        {/* App Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight">TrackSpace</span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wide">
                MODULAR WORKSPACE
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Projects Quick Access */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Projects ({projects.length})
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/projects/new');
                }}
                className="text-slate-400 hover:text-brand-600 p-0.5 rounded transition-colors"
                title="Create New Project"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 5).map((project) => {
                const isCurrent = location.pathname.startsWith(`/projects/${project.id}`);
                return (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}/overview`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors truncate',
                      isCurrent
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                    {project.project_type === 'shared' && (
                      <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                        team
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mx-3 mb-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Preview / Demo Mode</span>
              Data tersimpan lokal di browser. Hubungkan Supabase untuk sync multi-user.
            </div>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {getInitials(profile?.display_name)}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.display_name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {profile?.timezone || 'TrackSpace Workspace'}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Keluar"
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1.5 -ml-1 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">TrackSpace</span>
              <span className="text-slate-300">/</span>
              <span className="capitalize">
                {location.pathname === '/'
                  ? 'Main Dashboard'
                  : location.pathname.split('/')[1] || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/projects/new')}
            >
              New Project
            </Button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
