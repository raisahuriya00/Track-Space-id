import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '@/lib/dataService';
import { ModuleKey } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FolderKanban,
  User,
  Users,
  CheckSquare,
  Flame,
  Calendar,
  BarChart3,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const COLOR_OPTIONS = [
  '#4F46E5', // Indigo
  '#0D9488', // Teal
  '#2563EB', // Blue
  '#EA580C', // Orange
  '#7C3AED', // Violet
  '#059669', // Emerald
  '#E11D48', // Rose
];

export const CreateProjectWizard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [projectType, setProjectType] = useState<'personal' | 'shared'>('personal');
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>([
    'task_manager',
    'habit_tracker',
    'calendar',
    'reports',
  ]);
  const [error, setError] = useState<string | null>(null);

  const toggleModule = (key: ModuleKey) => {
    if (selectedModules.includes(key)) {
      if (selectedModules.length === 1) {
        setError('Minimal satu modul wajib dipilih.');
        return;
      }
      setSelectedModules(selectedModules.filter((m) => m !== key));
    } else {
      setSelectedModules([...selectedModules, key]);
    }
    setError(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Nama project wajib diisi.');
      setStep(1);
      return;
    }

    if (selectedModules.length === 0) {
      setError('Minimal satu modul wajib aktif.');
      setStep(3);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const created = await DataService.createProject({
        name: name.trim(),
        description: description.trim(),
        icon: 'folder',
        color,
        project_type: projectType,
        modules: selectedModules,
      });

      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${created.id}/overview`);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-slate-700">Project Info</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-3">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-slate-700">Project Type</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-3">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="text-xs font-medium text-slate-700">Features</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Informasi Project'}
            {step === 2 && 'Pilih Tipe Project'}
            {step === 3 && 'Pilih Modul Workspace'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Nama Project"
                required
                placeholder="Contoh: Farmasi AI, Manajemen Skripsi"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
                <textarea
                  className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  rows={3}
                  placeholder="Tuliskan tujuan atau cakupan project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Warna Aksen Project</label>
                <div className="flex items-center gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setProjectType('personal')}
                className={`p-5 rounded-card border-2 cursor-pointer transition-all ${
                  projectType === 'personal'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-brand-600 flex items-center justify-center mb-3">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">Personal Project</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ruang kerja pribadi. Hanya Anda sebagai pemilik yang dapat mengakses. Dapat diubah ke Shared nanti.
                </p>
              </div>

              <div
                onClick={() => setProjectType('shared')}
                className={`p-5 rounded-card border-2 cursor-pointer transition-all ${
                  projectType === 'shared'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">Shared Project</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ruang kerja kolaborasi. Anda dapat mengundang anggota tim, menugaskan task, dan mengelola peran.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Pilih modul yang ingin diaktifkan. Anda dapat mengubah pilihan ini kapan saja di Project Settings tanpa menghapus data.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'task_manager' as ModuleKey,
                    title: 'Task Manager',
                    desc: 'Daftar task, status To Do/In Progress/Done, deadline, dan penugasan.',
                    icon: CheckSquare,
                  },
                  {
                    key: 'habit_tracker' as ModuleKey,
                    title: 'Habit Tracker',
                    desc: 'Pelacakan kebiasaan berkala (harian/mingguan) dengan logging dan konsistensi.',
                    icon: Flame,
                  },
                  {
                    key: 'calendar' as ModuleKey,
                    title: 'Calendar',
                    desc: 'Tampilan bulanan & mingguan dari deadline task dan jadwal habit.',
                    icon: Calendar,
                  },
                  {
                    key: 'reports' as ModuleKey,
                    title: 'Progress & Reports',
                    desc: 'Statistik penyelesaian task dan grafik konsistensi aktivitas.',
                    icon: BarChart3,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = selectedModules.includes(item.key);
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleModule(item.key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-brand-600 bg-brand-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isChecked ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-slate-900 text-xs">{item.title}</h5>
                          {isChecked && <Check className="w-4 h-4 text-brand-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep((s) => (s - 1) as any)}
              >
                Kembali
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                Batal
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  if (step === 1 && !name.trim()) {
                    setError('Nama project wajib diisi.');
                    return;
                  }
                  setError(null);
                  setStep((s) => (s + 1) as any);
                }}
              >
                Lanjut
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleCreate}
              >
                Buat Project Sekarang
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
