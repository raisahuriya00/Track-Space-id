import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, CheckSquare, Flame, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
  todo: '#94A3B8', // Slate
  in_progress: '#F59E0B', // Amber
  done: '#10B981', // Emerald
};

export const ProgressReportsTab: React.FC = () => {
  const { project } = useOutletContext<{ project: Project }>();

  const isTaskManagerActive =
    project.modules?.some((m) => m.module_key === 'task_manager' && m.is_enabled) ?? false;
  const isHabitTrackerActive =
    project.modules?.some((m) => m.module_key === 'habit_tracker' && m.is_enabled) ?? false;

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: () => DataService.getTasks(project.id),
    enabled: isTaskManagerActive,
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', project.id],
    queryFn: () => DataService.getHabits(project.id),
    enabled: isHabitTrackerActive,
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ['habit_logs', project.id],
    queryFn: () => DataService.getHabitLogs(project.id),
    enabled: isHabitTrackerActive,
  });

  // Calculate Task Metrics (PRD 9.1)
  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : null;

  const taskDistributionData = [
    { name: 'To Do', value: todoCount, color: STATUS_COLORS.todo },
    { name: 'In Progress', value: inProgressCount, color: STATUS_COLORS.in_progress },
    { name: 'Done', value: doneCount, color: STATUS_COLORS.done },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: 'High', count: tasks.filter((t) => t.priority === 'high').length },
    { name: 'Medium', count: tasks.filter((t) => t.priority === 'medium').length },
    { name: 'Low', count: tasks.filter((t) => t.priority === 'low').length },
  ];

  if (!isTaskManagerActive && !isHabitTrackerActive) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Modul Sumber Data Nonaktif"
        description="Progress & Reports memerlukan setidaknya Task Manager atau Habit Tracker aktif untuk menganalisis data metrik."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalTasks}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">
            {completionPercentage !== null ? `${completionPercentage}%` : '—'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tasks Selesai</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{doneCount}</p>
        </Card>
      </div>

      {/* Task Visualizations */}
      {isTaskManagerActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Distribusi Status Task</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {totalTasks === 0 ? (
                <p className="text-xs text-slate-400">Belum ada task yang dibuat.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Distribusi Prioritas Task</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {totalTasks === 0 ? (
                <p className="text-xs text-slate-400">Belum ada task yang dibuat.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="#94A3B8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Habit Consistency Section */}
      {isHabitTrackerActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Metrik Konsistensi Habit Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada habit yang dibuat.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((habit) => {
                  const completedLogs = habitLogs.filter(
                    (l) => l.habit_id === habit.id && l.completed
                  ).length;

                  return (
                    <div
                      key={habit.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2"
                    >
                      <h4 className="font-semibold text-slate-900 text-xs truncate">{habit.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Total {completedLogs} hari tercatat selesai
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Kebiasaan {habit.frequency_type === 'daily' ? 'Harian' : 'Mingguan'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
