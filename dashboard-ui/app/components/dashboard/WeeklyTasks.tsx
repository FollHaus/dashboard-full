"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/services/task/task.service";
import { TaskStatus } from "@/shared/interfaces/task.interface";
import { useAuth } from "@/hooks/useAuth";

const WeeklyTasks: React.FC = () => {
  const { user } = useAuth();
  const [onlyMine, setOnlyMine] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["weekly-tasks"],
    queryFn: () => TaskService.getAll(),
  });

  if (isLoading) {
    return <div className="h-40 bg-neutral-100 rounded-card animate-pulse" />;
  }

  if (error || !data) {
    return <div className="text-error">Нет данных</div>;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  let tasks = data;
  if (onlyMine && user?.name) {
    tasks = tasks.filter((t) => t.executor === user.name);
  }

  const overdue = tasks.filter(
    (t) => new Date(t.deadline) < now && t.status !== TaskStatus.Completed
  ).length;
  const thisWeek = tasks.filter((t) => {
    const d = new Date(t.deadline);
    return d >= now && d <= weekEnd;
  }).length;
  const inProgress = tasks.filter((t) => t.status === TaskStatus.InProgress).length;

  const list = tasks
    .filter((t) => {
      const d = new Date(t.deadline);
      return d >= now && d <= weekEnd;
    })
    .slice(0, 5);

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Задачи недели</h3>
        <Link href="/tasks" className="text-sm text-primary-600">
          Показать все
        </Link>
      </div>
      {user && (
        <label className="flex items-center gap-2 mb-2 text-sm">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          Только мои
        </label>
      )}
      <div className="flex gap-4 mb-4 text-center">
        <div className="flex-1">
          <div className="text-2xl font-semibold">{overdue}</div>
          <div className="text-sm text-neutral-600">Просрочено</div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold">{thisWeek}</div>
          <div className="text-sm text-neutral-600">На этой неделе</div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold">{inProgress}</div>
          <div className="text-sm text-neutral-600">В работе</div>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="text-sm text-neutral-600">Нет данных</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {list.map((t) => (
            <li key={t.id} className="flex justify-between">
              <span>{t.title}</span>
              <span className="text-neutral-600">
                {new Date(t.deadline).toLocaleDateString("ru-RU")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WeeklyTasks;
