import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { CalendarView } from './CalendarView';

export const GlobalCalendarPage: React.FC = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => DataService.getProjects(),
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => DataService.getTasks(),
  });

  const { data: allHabits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => DataService.getHabits(),
  });

  // Filter tasks and habits only from projects where corresponding modules are active (PRD 8.2)
  const taskActiveProjectIds = new Set(
    projects
      .filter((p) => p.modules?.some((m) => m.module_key === 'task_manager' && m.is_enabled))
      .map((p) => p.id)
  );

  const habitActiveProjectIds = new Set(
    projects
      .filter((p) => p.modules?.some((m) => m.module_key === 'habit_tracker' && m.is_enabled))
      .map((p) => p.id)
  );

  const validTasks = allTasks.filter((t) => taskActiveProjectIds.has(t.project_id));
  const validHabits = allHabits.filter((h) => habitActiveProjectIds.has(h.project_id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">
          Jadwal deadline dan kebiasaan dari seluruh project aktif Anda.
        </p>
      </div>

      <CalendarView
        tasks={validTasks}
        habits={validHabits}
        isTaskManagerActive={true}
        isHabitTrackerActive={true}
      />
    </div>
  );
};
