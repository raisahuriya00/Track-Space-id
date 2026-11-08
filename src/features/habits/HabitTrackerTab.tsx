import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project, Habit, HabitLog, HabitFrequency } from '@/types/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  Flame,
  Plus,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { day: 1, label: 'Sen' },
  { day: 2, label: 'Sel' },
  { day: 3, label: 'Rab' },
  { day: 4, label: 'Kam' },
  { day: 5, label: 'Jum' },
  { day: 6, label: 'Sab' },
  { day: 7, label: 'Min' },
];

export const HabitTrackerTab: React.FC = () => {
  const { project } = useOutletContext<{ project: Project }>();
  const queryClient = useQueryClient();

  // Selected date for daily logging (default: today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<HabitFrequency>('daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const { data: habits = [], isLoading: loadingHabits } = useQuery({
    queryKey: ['habits', project.id],
    queryFn: () => DataService.getHabits(project.id),
  });

  const { data: habitLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['habit_logs', project.id],
    queryFn: () => DataService.getHabitLogs(project.id),
  });

  const toggleLogMutation = useMutation({
    mutationFn: ({ habitId, dateStr }: { habitId: string; dateStr: string }) =>
      DataService.toggleHabitLog(habitId, project.id, dateStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_logs', project.id] });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: (data: {
      project_id: string;
      name: string;
      description?: string;
      frequency_type: HabitFrequency;
      schedule_days: number[];
    }) => DataService.createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', project.id] });
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setFrequencyType('daily');
      setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
    },
  });

  // Date stepper
  const shiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Calculate 7-day completion rate per habit (Section 7.3)
  const getHabitRate = (habit: Habit) => {
    const past7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past7Days.push(d.toISOString().split('T')[0]);
    }

    let scheduledCount = 0;
    let completedCount = 0;

    past7Days.forEach((dateStr) => {
      const d = new Date(dateStr);
      const dayNum = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon, 7=Sun
      const isScheduled =
        habit.frequency_type === 'daily' || habit.schedule_days.includes(dayNum);

      if (isScheduled) {
        scheduledCount++;
        const hasCompleted = habitLogs.some(
          (l) => l.habit_id === habit.id && l.log_date === dateStr && l.completed
        );
        if (hasCompleted) completedCount++;
      }
    });

    if (scheduledCount === 0) return '—';
    return `${Math.round((completedCount / scheduledCount) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice on Shared Project (PRD 7.4) */}
      {project.project_type === 'shared' && (
        <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-lg text-xs text-sky-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span>
            <strong>Privasi Habit:</strong> Pada Shared Project, seluruh kebiasaan dan catatan checklist ini bersifat privat dan hanya dapat dilihat oleh Anda sendiri.
          </span>
        </div>
      )}

      {/* Date Navigator Header */}
      <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(selectedDate)}</span>
            {isToday && (
              <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.2 rounded font-bold">
                Hari Ini
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => shiftDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!isToday && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Kembali ke Hari Ini
            </Button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tambah Habit
        </Button>
      </div>

      {/* Habits Checklist for Selected Date */}
      {habits.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Belum Ada Habit"
          description="Tambahkan kebiasaan positif seperti membaca jurnal, coding, atau olahraga untuk memantau konsistensi Anda."
          actionLabel="Buat Habit Pertama"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Checklist (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Checklist Habit — {formatDate(selectedDate)}
            </h3>

            <div className="space-y-2.5">
              {habits.map((habit) => {
                const isLogged = habitLogs.some(
                  (l) =>
                    l.habit_id === habit.id &&
                    l.log_date === selectedDate &&
                    l.completed
                );

                const selectedDayNum =
                  new Date(selectedDate).getDay() === 0 ? 7 : new Date(selectedDate).getDay();
                const isScheduledToday =
                  habit.frequency_type === 'daily' ||
                  habit.schedule_days.includes(selectedDayNum);

                return (
                  <div
                    key={habit.id}
                    onClick={() =>
                      toggleLogMutation.mutate({
                        habitId: habit.id,
                        dateStr: selectedDate,
                      })
                    }
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isLogged
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                          isLogged
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isLogged && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isLogged ? 'text-emerald-950' : 'text-slate-900'
                          }`}
                        >
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {habit.description}
                          </p>
                        )}
                        {!isScheduledToday && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-1">
                            Tidak dijadwalkan untuk hari ini
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={habit.frequency_type === 'daily' ? 'neutral' : 'info'} size="sm">
                        {habit.frequency_type === 'daily' ? 'Harian' : 'Mingguan'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consistency & Stats Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Konsistensi (7 Hari Terakhir)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {habits.map((habit) => {
                  const rateStr = getHabitRate(habit);
                  return (
                    <div key={habit.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {habit.name}
                        </span>
                        <span className="font-bold text-slate-700">{rateStr}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: rateStr === '—' ? '0%' : rateStr }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CREATE HABIT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Habit Baru"
        description="Tetapkan kebiasaan yang ingin Anda pantau secara rutin."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createHabitMutation.mutate({
              project_id: project.id,
              name: name.trim(),
              description: description.trim() || undefined,
              frequency_type: frequencyType,
              schedule_days: scheduleDays,
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Nama Habit"
            required
            placeholder="Contoh: Membaca paper farmasi 30 menit"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Deskripsi (Opsional)</label>
            <textarea
              rows={2}
              className="block w-full rounded-input border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Catatan tujuan atau pengingat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Frekuensi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrequencyType('daily');
                  setScheduleDays([1, 2, 3, 4, 5, 6, 7]);
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  frequencyType === 'daily'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Setiap Hari
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('weekly')}
                className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  frequencyType === 'weekly'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Hari Tertentu (Mingguan)
              </button>
            </div>
          </div>

          {frequencyType === 'weekly' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">Pilih Hari Aktif:</label>
              <div className="flex items-center gap-1.5">
                {DAYS_OF_WEEK.map((item) => {
                  const isSelected = scheduleDays.includes(item.day);
                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (scheduleDays.length > 1) {
                            setScheduleDays(scheduleDays.filter((d) => d !== item.day));
                          }
                        } else {
                          setScheduleDays([...scheduleDays, item.day]);
                        }
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createHabitMutation.isPending}
            >
              Simpan Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
