import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Task, TaskStatus, TaskPriority } from '@/types/database';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TaskPriorityBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Search, Calendar, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GlobalMyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => DataService.getTasks(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => DataService.getProjects(),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      DataService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || t.project_id === projectFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar seluruh task Anda dari seluruh project yang dapat Anda akses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'todo', 'in_progress', 'done'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? 'Semua' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs font-medium rounded-input border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">Semua Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs font-medium rounded-input border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Cari task..."
            leftIcon={<Search className="w-3.5 h-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Tidak Ada Task Ditemukan"
          description="Tidak ada task yang cocok dengan kriteria filter Anda saat ini."
        />
      ) : (
        <div className="bg-white rounded-card border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4 min-w-[220px]">Task Name</th>
                  <th className="py-3 px-4 w-48">Project Asal</th>
                  <th className="py-3 px-4 w-28">Priority</th>
                  <th className="py-3 px-4 w-36">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Status Select */}
                    <td className="py-3 px-4 text-center">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTaskMutation.mutate({
                            id: task.id,
                            updates: { status: e.target.value as TaskStatus },
                          })
                        }
                        className={`text-[11px] font-semibold rounded px-2 py-0.5 border cursor-pointer focus:outline-none ${
                          task.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : task.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>

                    {/* Task Title */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold text-slate-900 block ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>

                    {/* Origin Project */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                        className="flex items-center gap-2 text-left hover:text-brand-600 font-medium text-slate-700 transition-colors"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.project?.color || '#4F46E5' }}
                        />
                        <span className="truncate">{task.project?.name || 'Project'}</span>
                      </button>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {task.due_date ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(task.due_date)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
