import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, FolderKanban, Search, Users, User, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const MyProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'shared'>('all');
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => DataService.getProjects(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => DataService.getTasks(),
  });

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filterType === 'all' || p.project_type === filterType;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh project personal dan kolaborasi tim Anda dalam satu tempat.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/projects/new')}
        >
          Create New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-card border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setFilterType('personal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'personal'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Personal ({projects.filter((p) => p.project_type === 'personal').length})
          </button>
          <button
            onClick={() => setFilterType('shared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'shared'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Shared ({projects.filter((p) => p.project_type === 'shared').length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Cari project..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Tidak Ada Project Ditemukan"
          description={
            search
              ? 'Tidak ada project yang cocok dengan kata kunci pencarian Anda.'
              : 'Mulai buat project pertama Anda untuk mengorganisir task dan habit.'
          }
          actionLabel="Buat Project Baru"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const projectTasks = allTasks.filter((t) => t.project_id === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === 'done');
            const progress =
              projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}/overview`)}
                className="bg-white rounded-card border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <h3 className="font-semibold text-slate-900 text-sm group-hover:text-brand-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <Badge variant={project.project_type === 'shared' ? 'info' : 'neutral'} size="sm">
                      {project.project_type === 'shared' ? 'Shared' : 'Personal'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {project.description || 'Tidak ada deskripsi.'}
                  </p>

                  {/* Active Modules */}
                  <div className="mt-4 flex flex-wrap gap-1">
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
                </div>

                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {doneTasks.length}/{projectTasks.length} Task Selesai ({progress}%)
                  </span>
                  <span className="flex items-center gap-1 font-medium text-brand-600 group-hover:translate-x-0.5 transition-transform">
                    Buka <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
