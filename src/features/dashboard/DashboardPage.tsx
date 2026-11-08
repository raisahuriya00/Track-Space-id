import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
  CheckSquare,
  Activity,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => DataService.getProjects(),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => DataService.getTasks(),
  });

  // Calculate statistics only from projects where task_manager is active (PRD 4.2)
  const activeTaskProjectIds = new Set(
    projects
      .filter((p) => p.modules?.some((m) => m.module_key === 'task_manager' && m.is_enabled))
      .map((p) => p.id)
  );

  const validTasks = tasks.filter((t) => activeTaskProjectIds.has(t.project_id));
  const todoTasks = validTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = validTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = validTasks.filter((t) => t.status === 'done');

  // Upcoming deadlines (tasks not done, sorted by due date)
  const upcomingTasks = validTasks
    .filter((t) => t.status !== 'done' && t.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-card border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang di TrackSpace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan lintas-project untuk mengorganisir task, habit, dan kolaborasi dalam satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/projects/new')}
          >
            Create New Project
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{projects.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                To Do Tasks
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{todoTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                In Progress
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Done Tasks
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{doneTasks.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Projects Aktif</h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/projects')}
            >
              Lihat Semua
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => {
              const projectTasks = tasks.filter((t) => t.project_id === project.id);
              const doneCount = projectTasks.filter((t) => t.status === 'done').length;
              const progressPct =
                projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}/overview`)}
                  className="bg-white p-5 rounded-card border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-semibold text-slate-900 text-sm hover:text-brand-600 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                      </div>
                      <Badge variant={project.project_type === 'shared' ? 'info' : 'neutral'} size="sm">
                        {project.project_type === 'shared' ? 'Shared' : 'Personal'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                      {project.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  <div>
                    {/* Active Modules Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.modules
                        ?.filter((m) => m.is_enabled)
                        .map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {m.module_key.replace('_', ' ')}
                          </span>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Progress Task</span>
                        <span>
                          {doneCount}/{projectTasks.length} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Upcoming Deadlines & Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ada deadline task yang mendesak.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/projects/${t.project_id}/tasks`)}
                      className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 font-medium">
                            {formatDate(t.due_date)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500 truncate">
                            {t.project?.name || 'Project'}
                          </span>
                        </div>
                      </div>
                      <TaskPriorityBadge priority={t.priority} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs text-slate-600 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-brand-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Task dibuat</span> pada project{' '}
                  <span className="font-medium text-brand-600">Farmasi AI Research</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hari ini</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Habit diselesaikan:</span> Membaca 1
                  Paper Farmakologi
                  <p className="text-[10px] text-slate-400 mt-0.5">Kemarin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
