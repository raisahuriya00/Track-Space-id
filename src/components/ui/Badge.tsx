import React from 'react';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority } from '@/types/database';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'todo':
      return <Badge variant="neutral">To Do</Badge>;
    case 'in_progress':
      return <Badge variant="warning">In Progress</Badge>;
    case 'done':
      return <Badge variant="success">Done</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const TaskPriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case 'high':
      return <Badge variant="danger">High</Badge>;
    case 'medium':
      return <Badge variant="warning">Medium</Badge>;
    case 'low':
      return <Badge variant="info">Low</Badge>;
    default:
      return <Badge variant="neutral">{priority}</Badge>;
  }
};
