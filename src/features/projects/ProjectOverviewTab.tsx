import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Flame,
  Calendar,
  BarChart3,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const ProjectOverviewTab: React.FC = () => {
  const { project } = useOutletContext<{ project: Project }>();
  const navigate = useNavigate();

  const isModuleActive = (key: string) => {
    return project.modules?.some((m) => m.module_key === key && m.is_enabled);
  };

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: () => DataService.getTasks(project.id),
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', project.id],
    queryFn: () => DataService.getHabits(project.id),
  });

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const progressPct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'done' && t.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tasks Selesai</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{doneTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">
            {tasks.length > 0 ? `${progressPct}%` : '—'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Modules Quick Launcher */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Modul Workspace Aktif</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isModuleActive('task_manager') && (
                <div
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-sm cursor-pointer transition-all bg-white flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      Task Manager <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {tasks.length} task tercatat ({todoTasks.length} to do)
                    </p>
                  </div>
                </div>
              )}

              {isModuleActive('habit_tracker') && (
                <div
                  onClick={() => navigate(`/projects/${project.id}/habits`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-sm cursor-pointer transition-all bg-white flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      Habit Tracker <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {habits.length} kebiasaan aktif untuk project ini
                    </p>
                  </div>
                </div>
              )}

              {isModuleActive('calendar') && (
                <div
                  onClick={() => navigate(`/projects/${project.id}/calendar`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-sm cursor-pointer transition-all bg-white flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      Calendar <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Jadwal deadline & kebiasaan bulanan
                    </p>
                  </div>
                </div>
              )}

              {isModuleActive('reports') && (
                <div
                  onClick={() => navigate(`/projects/${project.id}/reports`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all bg-white flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      Progress & Reports <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Analisis metrik penyelesaian & konsistensi
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Project Deadlines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Deadline Terdekat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ada deadline yang belum selesai.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                      className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(t.due_date)}</p>
                      </div>
                      <TaskPriorityBadge priority={t.priority} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
