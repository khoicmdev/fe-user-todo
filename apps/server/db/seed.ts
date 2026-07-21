import type { User, ToDoItem } from "@repo/shared";

export const initialUsers: User[] = [
  { id: 1, username: "john_doe", todoItems: [], createdDate: "2026-07-01T08:00:00.000Z" },
  { id: 2, username: "jane_smith", todoItems: [], createdDate: "2026-07-02T09:30:00.000Z" },
  { id: 3, username: "alex_dev", todoItems: [], createdDate: "2026-07-03T11:15:00.000Z" },
  { id: 4, username: "sarah_connor", todoItems: [], createdDate: "2026-07-04T14:20:00.000Z" },
  { id: 5, username: "michael_scott", todoItems: [], createdDate: "2026-07-05T16:45:00.000Z" },
  { id: 6, username: "emily_watson", todoItems: [], createdDate: "2026-07-06T10:10:00.000Z" },
  { id: 7, username: "david_beckham", todoItems: [], createdDate: "2026-07-07T13:00:00.000Z" },
  { id: 8, username: "lisa_simpson", todoItems: [], createdDate: "2026-07-08T15:30:00.000Z" },
  { id: 9, username: "bruce_wayne", todoItems: [], createdDate: "2026-07-09T18:00:00.000Z" },
  { id: 10, username: "clark_kent", todoItems: [], createdDate: "2026-07-10T20:00:00.000Z" },
];

const taskTitles = [
  "Setup Turborepo workspace",
  "Implement Zod validation schema",
  "Design UI with Tailwind CSS",
  "Connect React Query to REST API",
  "Write unit tests for endpoints",
  "Configure CI/CD deployment pipeline",
  "Optimize TanStack Router caching",
  "Add error boundary and fallback UI",
  "Audit accessibility standards",
  "Deploy staging build to Vercel",
];

export const initialTodos: ToDoItem[] = Array.from({ length: 100 }, (_, index) => {
  const id = 101 + index;
  const template = taskTitles[index % taskTitles.length];
  const batch = Math.floor(index / taskTitles.length) + 1;
  const assigneeId = (index % 10) + 1;
  const isCompleted = index % 3 === 0;

  const baseDate = new Date("2026-07-01T00:00:00.000Z").getTime();
  const createdDate = new Date(baseDate + index * 3600000 * 4).toISOString();

  return {
    id,
    title: `${template} (Phase ${batch})`,
    isCompleted,
    assigneeId,
    createdDate,
  };
});
