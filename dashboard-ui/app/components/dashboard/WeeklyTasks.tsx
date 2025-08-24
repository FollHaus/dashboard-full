"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TaskService } from "@/services/task/task.service";
import { ITask, TaskStatus } from "@/shared/interfaces/task.interface";
import { useMemo, useState } from "react";

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
  const [segment, setSegment] = useState<"all" | "today" | "overdue">("all");

  if (isLoading) {
    return <div className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card h-40 animate-pulse" />;
  }

  const now = new Date();
  const tasks: ITask[] = data || [];
  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.deadline);
    return (
      d.toDateString() === now.toDateString() && t.status !== TaskStatus.Completed
    );
  });
  const overdueTasks = tasks.filter((t) => {
    const d = new Date(t.deadline);
    return d < now && t.status !== TaskStatus.Completed;
  });
  const otherTasks = tasks.filter(
    (t) => !todayTasks.includes(t) && !overdueTasks.includes(t)
  );
  const segments = [
    { value: "all", label: `Все (${tasks.length})` },
    { value: "today", label: `Сегодня (${todayTasks.length})` },
    { value: "overdue", label: `Просроченные (${overdueTasks.length})` },
  ];

  let list: ITask[] = [];
  if (segment === "today") list = todayTasks;
  else if (segment === "overdue")
    list = overdueTasks.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  else
    list = [
      ...todayTasks,
      ...overdueTasks.sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ),
      ...otherTasks.sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ),
    ];
  list = list.slice(0, 10);

  return (
    <div className="bg-neutral-200 p-4 md:p-5 rounded-2xl shadow-card relative overflow-hidden">
      {isFetching && (
        <div className="absolute inset-0 bg-neutral-200/50 animate-pulse" />
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">✅ Задачи недели</h3>
        <Link
          href={`/tasks?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(
            endIso
          )}`}
          className="text-sm text-primary-600"
        >
          Показать все
        </Link>
      </div>
      <div className="flex gap-2 mb-4 text-sm">
        {segments.map((s) => (
          <button
            key={s.value}
            onClick={() => setSegment(s.value as any)}
            className={`px-2 py-1 rounded border ${
              segment === s.value
                ? "bg-primary-500 text-white border-primary-500"
                : "border-neutral-300"
            }`}
          >
            {s.label}
          </button>
        ))}
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
      {!isError && list.length === 0 && (
        <div className="text-sm text-neutral-600">
          Нет задач на этой неделе
        </div>
      )}
      {!isError && list.length > 0 && (
        <ul className="text-sm divide-y divide-neutral-200">
          <li className="grid grid-cols-3 py-1 text-xs text-neutral-600">
            <span>Название</span>
            <span>Ответственный</span>
            <span>Срок</span>
          </li>
          {list.map((t) => {
            const deadline = new Date(t.deadline);
            const isToday = deadline.toDateString() === now.toDateString();
            const isOverdue = deadline < now && t.status !== TaskStatus.Completed;
            const isCompleted = t.status === TaskStatus.Completed;
            let color = "";
            let statusLabel: string | null = null;
            if (isCompleted) {
              color = "text-success";
              statusLabel = "Выполнено";
            } else if (isOverdue) {
              color = "text-error";
              statusLabel = "Просрочено";
            } else if (isToday) {
              color = "text-warning";
              statusLabel = "Сегодня";
            }
            return (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}`}
                  className={`grid grid-cols-3 p-2 hover:bg-primary-200 rounded transition duration-350 ease-in-out ${color}`}
                >
                  <span>{t.title}</span>
                  <span>{t.executor || "-"}</span>
                  <span className="flex items-center gap-2">
                    {deadline.toLocaleDateString("ru-RU")}
                    {statusLabel && (
                      <span className={`text-xs ${color}`}>{statusLabel}</span>
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
