import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Project } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/dataService';
import { CalendarView } from './CalendarView';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar } from 'lucide-react';

export const ProjectCalendarTab: React.FC = () => {
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

  if (!isTaskManagerActive && !isHabitTrackerActive) {
    return (
      <EmptyState
        icon={Calendar}
        title="Tidak Ada Sumber Data Aktif"
        description="Calendar ini aktif, namun Task Manager dan Habit Tracker pada project ini sedang dinonaktifkan. Aktifkan modul terkait di Project Settings untuk menampilkan deadline atau jadwal kebiasaan."
      />
    );
  }

  return (
    <CalendarView
      tasks={tasks}
      habits={habits}
      isTaskManagerActive={isTaskManagerActive}
      isHabitTrackerActive={isHabitTrackerActive}
    />
  );
};
