import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Project, ModuleKey } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  CheckSquare,
  Flame,
  Calendar,
  BarChart3,
  Users,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  Share2,
} from 'lucide-react';

const MODULE_DEFINITIONS: { key: ModuleKey; label: string; desc: string; icon: any }[] = [
  {
    key: 'task_manager',
    label: 'Task Manager',
    desc: 'Kelola task, status To Do, In Progress, Done, dan deadline.',
    icon: CheckSquare,
  },
  {
    key: 'habit_tracker',
    label: 'Habit Tracker',
    desc: 'Catat kebiasaan harian dan mingguan secara privat.',
    icon: Flame,
  },
  {
    key: 'calendar',
    label: 'Calendar',
    desc: 'Tampilan kalender terintegrasi deadline dan jadwal.',
    icon: Calendar,
  },
  {
    key: 'reports',
    label: 'Progress & Reports',
    desc: 'Grafik dan ringkasan metrik penyelesaian.',
    icon: BarChart3,
  },
];

export const ProjectSettingsTab: React.FC = () => {
  const { project } = useOutletContext<{ project: Project }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // General Settings Form
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invite Link Copy
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Modals
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const updateProjectMutation = useMutation({
    mutationFn: (updates: Partial<Project>) => DataService.updateProject(project.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: ModuleKey; enabled: boolean }) =>
      DataService.toggleModule(project.id, key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const activeModulesCount = project.modules?.filter((m) => m.is_enabled).length || 0;

  const handleToggleModule = (key: ModuleKey, currentStatus: boolean) => {
    if (currentStatus && activeModulesCount <= 1) {
      setErrorMsg('Minimal satu modul harus tetap aktif pada project ini.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setErrorMsg(null);
    toggleModuleMutation.mutate({ key, enabled: !currentStatus });
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProjectMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
    });
  };

  const handleConvertShared = () => {
    updateProjectMutation.mutate(
      { project_type: 'shared' },
      {
        onSuccess: () => {
          setIsConvertModalOpen(false);
        },
      }
    );
  };

  const handleDeleteProject = () => {
    updateProjectMutation.mutate(
      { archived_at: new Date().toISOString() },
      {
        onSuccess: () => {
          navigate('/projects');
        },
      }
    );
  };

  const inviteLink = `${window.location.origin}/join/${project.id}?token=mock-invite-token`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <Input
              label="Nama Project"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Deskripsi Project</label>
              <textarea
                rows={3}
                className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Perubahan berhasil disimpan
                </span>
              )}
              <div className="ml-auto">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={updateProjectMutation.isPending}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Module Configuration (Section 2.3 & 5.3) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">Konfigurasi Modul</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Aktifkan atau nonaktifkan modul. Data tidak akan terhapus saat modul dinonaktifkan.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {MODULE_DEFINITIONS.map((mod) => {
              const Icon = mod.icon;
              const isEnabled =
                project.modules?.some((m) => m.module_key === mod.key && m.is_enabled) ?? false;

              return (
                <div key={mod.key} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isEnabled ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900">{mod.label}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{mod.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModule(mod.key, isEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-brand-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration / Convert to Shared (Section 5.4 & 10) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Kolaborasi & Tipe Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.project_type === 'personal' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Ubah Menjadi Shared Project</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Izinkan kolaborasi dengan mengundang anggota tim untuk mengerjakan task bersama.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                onClick={() => setIsConvertModalOpen(true)}
              >
                Konversi ke Shared
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold text-slate-900">Undang Anggota Tim</span>
                  </div>
                  <Badge variant="info" size="sm">
                    Shared Project
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Bagikan tautan berikut kepada anggota tim untuk bergabung ke project ini:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="block w-full rounded-input border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInvite}
                    leftIcon={copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copiedInvite ? 'Disalin' : 'Salin'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone: Archive / Delete Project */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50/50">
          <CardTitle className="text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Zona Bahaya
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-900">Arsipkan Project Ini</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Project akan diarsipkan dan disembunyikan dari daftar project aktif.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Arsipkan Project
          </Button>
        </CardContent>
      </Card>

      {/* CONVERT MODAL */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Konversi ke Shared Project"
        description="Setelah diubah ke Shared Project, Anda dapat mengundang anggota tim untuk berkolaborasi. Aksi ini bersifat satu arah."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Seluruh data task dan konfigurasi yang ada akan tetap tersimpan. Anda tetap menjadi
            satu-satunya owner sampai Anda mengundang anggota tim.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsConvertModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateProjectMutation.isPending}
              onClick={handleConvertShared}
            >
              Konfirmasi Konversi
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Arsipkan Project"
        description="Apakah Anda yakin ingin mengarsipkan project ini?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Project <strong>{project.name}</strong> tidak akan lagi muncul di dashboard dan navigasi.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={updateProjectMutation.isPending}
              onClick={handleDeleteProject}
            >
              Ya, Arsipkan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
