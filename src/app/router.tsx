import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MyProjectsPage } from '@/features/projects/MyProjectsPage';
import { CreateProjectWizard } from '@/features/projects/CreateProjectWizard';
import { ProjectWorkspace } from '@/features/projects/ProjectWorkspace';
import { ProjectOverviewTab } from '@/features/projects/ProjectOverviewTab';
import { ProjectTasksTab } from '@/features/tasks/ProjectTasksTab';
import { HabitTrackerTab } from '@/features/habits/HabitTrackerTab';
import { ProjectCalendarTab } from '@/features/calendar/ProjectCalendarTab';
import { ProgressReportsTab } from '@/features/reports/ProgressReportsTab';
import { ProjectSettingsTab } from '@/features/projects/ProjectSettingsTab';
import { GlobalMyTasksPage } from '@/features/tasks/GlobalMyTasksPage';
import { GlobalCalendarPage } from '@/features/calendar/GlobalCalendarPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'projects',
            element: <MyProjectsPage />,
          },
          {
            path: 'projects/new',
            element: <CreateProjectWizard />,
          },
          {
            path: 'projects/:projectId',
            element: <ProjectWorkspace />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <ProjectOverviewTab />,
              },
              {
                path: 'tasks',
                element: <ProjectTasksTab />,
              },
              {
                path: 'habits',
                element: <HabitTrackerTab />,
              },
              {
                path: 'calendar',
                element: <ProjectCalendarTab />,
              },
              {
                path: 'reports',
                element: <ProgressReportsTab />,
              },
              {
                path: 'settings',
                element: <ProjectSettingsTab />,
              },
            ],
          },
          {
            path: 'tasks',
            element: <GlobalMyTasksPage />,
          },
          {
            path: 'calendar',
            element: <GlobalCalendarPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
