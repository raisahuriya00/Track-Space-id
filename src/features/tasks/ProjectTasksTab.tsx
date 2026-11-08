import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, Task, TaskStatus, TaskPriority } from '@/types/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, TaskPriorityBadge, TaskStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

export const ProjectTasksTab: React.FC = () => {
  const { project } = useOutletContext<{ project: Project }>();
  const queryClient = useQueryClient();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at' | 'priority'>('due_date');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formDueDate, setFormDueDate] = useState('');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: () => DataService.getTasks(project.id),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      project_id: string;
      title: string;
      description?: string;
      priority: TaskPriority;
      due_date?: string | null;
    }) => DataService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      DataService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => DataService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskToDelete(null);
    },
  });

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormPriority('medium');
    setFormDueDate('');
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormPriority(task.priority);
    setFormDueDate(task.due_date || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        updates: {
          title: formTitle.trim(),
          description: formDescription.trim() || null,
          priority: formPriority,
          due_date: formDueDate || null,
        },
      });
    } else {
      createTaskMutation.mutate({
        project_id: project.id,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        priority: formPriority,
        due_date: formDueDate || null,
      });
    }
  };

  // Filter and Sort Tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      if (sortBy === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return b.created_at.localeCompare(a.created_at);
    });

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
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

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-56">
            <Input
              placeholder="Cari task..."
              leftIcon={<Search className="w-3.5 h-3.5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Task List View (Section 6 - List View Only!) */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Tidak Ada Task"
          description={
            search || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Tidak ada task yang cocok dengan filter aktif Anda.'
              : 'Belum ada task pada project ini. Mulai buat task pertama Anda.'
          }
          actionLabel="Tambah Task"
          onAction={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-card border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4 min-w-[240px]">Task Name</th>
                  <th className="py-3 px-4 w-32">Priority</th>
                  <th className="py-3 px-4 w-36">Due Date</th>
                  {project.project_type === 'shared' && (
                    <th className="py-3 px-4 w-32">Assignee</th>
                  )}
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Status Checkbox / Toggle */}
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

                    {/* Task Title & Description */}
                    <td className="py-3 px-4">
                      <div>
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
                      </div>
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

                    {/* Assignee (Shared Project) */}
                    {project.project_type === 'shared' && (
                      <td className="py-3 px-4">
                        {task.assignee ? (
                          <span className="font-medium text-slate-700">
                            {task.assignee.display_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}

                    {/* Action Menu */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(task)}
                          title="Edit Task"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          title="Hapus Task"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingTask)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Tambah Task Baru'}
        description={`Project: ${project.name}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Judul Task"
            required
            placeholder="Contoh: Analisis data docking senyawa"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
            <textarea
              rows={3}
              className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Detail instruksi atau catatan..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Prioritas</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTask(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
            >
              {editingTask ? 'Simpan Perubahan' : 'Buat Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="Hapus Task"
        description="Apakah Anda yakin ingin menghapus task ini? Task akan diarsipkan dari daftar."
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {taskToDelete?.title}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setTaskToDelete(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteTaskMutation.isPending}
              onClick={() => taskToDelete && deleteTaskMutation.mutate(taskToDelete.id)}
            >
              Hapus Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
