import React, { useState } from 'react';
import { Task, Habit, ModuleKey } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, TaskPriorityBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Flame,
  Filter,
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  habits: Habit[];
  isTaskManagerActive?: boolean;
  isHabitTrackerActive?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  habits,
  isTaskManagerActive = true,
  isHabitTrackerActive = true,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'habits'>('all');
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[] | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate days for monthly grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 is Monday, 6 is Sunday

  const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month filler days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateObj = new Date(year, month - 1, d);
    days.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i);
    // Add timezone offset safety
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Next month filler days to complete grid
  const totalSlots = Math.ceil(days.length / 7) * 7;
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    const dateObj = new Date(year, month + 1, i);
    days.push({
      dateStr: dateObj.toISOString().split('T')[0],
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Month Header and Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs ml-1">
              Hari Ini
            </Button>
          </div>
        </div>

        {/* Filter items */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          {isTaskManagerActive && (
            <button
              onClick={() => setFilterType('tasks')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-brand-600" />
              Tasks
            </button>
          )}
          {isHabitTrackerActive && (
            <button
              onClick={() => setFilterType('habits')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                filterType === 'habits'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Habits
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-card border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
          <span>Min</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
          {days.map((d, index) => {
            const isTodayCell = d.dateStr === todayStr;

            // Get tasks on this due date (if task manager active)
            const dayTasks = isTaskManagerActive
              ? tasks.filter((t) => t.due_date === d.dateStr)
              : [];

            // Get habits scheduled on this day of week
            const dayOfWeek = new Date(d.dateStr).getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
            const dayHabits = isHabitTrackerActive
              ? habits.filter(
                  (h) =>
                    h.frequency_type === 'daily' ||
                    h.schedule_days.includes(adjustedDayOfWeek)
                )
              : [];

            const showTasks = filterType === 'all' || filterType === 'tasks';
            const showHabits = filterType === 'all' || filterType === 'habits';

            return (
              <div
                key={index}
                className={`p-1.5 sm:p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
                  !d.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-300'
                    : isTodayCell
                    ? 'bg-brand-50/20'
                    : 'bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isTodayCell
                        ? 'bg-brand-600 text-white font-bold'
                        : d.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                  {(dayTasks.length > 0 || dayHabits.length > 0) && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {(showTasks ? dayTasks.length : 0) + (showHabits ? dayHabits.length : 0)}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {/* Task Items */}
                  {showTasks &&
                    dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        title={t.title}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                          t.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700 line-through'
                            : 'bg-indigo-50 text-brand-700'
                        }`}
                      >
                        <CheckSquare className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                  {/* Habit Items */}
                  {showHabits &&
                    dayHabits.slice(0, 1).map((h) => (
                      <div
                        key={h.id}
                        title={h.name}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-amber-50 text-amber-700 flex items-center gap-1"
                      >
                        <Flame className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{h.name}</span>
                      </div>
                    ))}

                  {/* Overflow badge */}
                  {dayTasks.length > 2 && (
                    <span className="text-[9px] text-slate-500 font-semibold block text-center">
                      +{dayTasks.length - 2} task lagi
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
