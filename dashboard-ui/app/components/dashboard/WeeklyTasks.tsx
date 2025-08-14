"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/services/task/task.service";
import { ITask, TaskStatus } from "@/shared/interfaces/task.interface";
import { useMemo } from "react";

function getWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? 6 : day - 1;
  const start = new Date(today);
  start.setDate(today.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const WeeklyTasks = () => {
  const { start, end } = useMemo(getWeekRange, []);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["weekly-tasks", startIso, endIso],
    queryFn: () => TaskService.getAll({ start: startIso, end: endIso }),
  });

  if (isLoading) {
    return <div className="bg-neutral-100 p-4 rounded-card shadow-card h-40 animate-pulse" />;
  }

  const now = new Date();

  const tasks = (data || [])
    .filter((t: ITask) => t.status !== TaskStatus.Completed)
    .sort(
      (a: ITask, b: ITask) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )
    .slice(0, 10);

  return (
    <div className="bg-neutral-100 p-4 rounded-card shadow-card relative overflow-hidden">
      {isFetching && (
        <div className="absolute inset-0 bg-neutral-100/50 animate-pulse" />
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Задачи недели</h3>
        <Link
          href={`/tasks?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(
            endIso
          )}`}
          className="text-sm text-primary-600"
        >
          Показать все
        </Link>
      </div>
      {isError && (
        <div className="text-center">
          <p className="text-error mb-2">Не удалось загрузить</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-primary-600"
          >
            Повторить
          </button>
        </div>
      )}
      {!isError && tasks.length === 0 && (
        <div className="text-sm text-neutral-600">
          Нет задач на этой неделе
        </div>
      )}
      {!isError && tasks.length > 0 && (
        <ul className="text-sm divide-y divide-neutral-200">
          <li className="grid grid-cols-3 py-1 text-xs text-neutral-600">
            <span>Название</span>
            <span>Ответственный</span>
            <span>Дедлайн</span>
          </li>
          {tasks.map((t) => {
            const deadline = new Date(t.deadline);
            const diff = deadline.getTime() - now.getTime();
            const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
            const isOverdue = diff < 0;

            let badge: string | null = null;
            if (!isOverdue && daysLeft <= 3) {
              if (deadline.toDateString() === now.toDateString()) {
                badge = "Сегодня";
              } else if (daysLeft === 1) {
                badge = "Завтра";
              } else {
                badge = "≤ 3 дня";
              }
            }

            let rowBg = "";
            if (!isOverdue) {
              if (daysLeft <= 3) rowBg = "bg-red-50";
              else if (daysLeft <= 7) rowBg = "bg-yellow-50";
            }

            return (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}`}
                  className={`grid grid-cols-3 py-2 hover:bg-neutral-200 rounded ${
                    isOverdue ? "text-error" : ""
                  } ${rowBg}`}
                >
                  <span>{t.title}</span>
                  <span>{t.executor || "-"}</span>
                  <span className="flex items-center gap-2">
                    {deadline.toLocaleDateString("ru-RU")}
                    {isOverdue ? (
                      <span className="text-error text-xs">просрочено</span>
                    ) : (
                      badge && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded">
                          {badge}
                        </span>
                      )
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WeeklyTasks;
