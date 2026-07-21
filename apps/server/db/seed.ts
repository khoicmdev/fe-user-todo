import type { User, ToDoItem } from "@repo/shared";

export const initialUsers: User[] = [
  { id: 1, username: "john_doe", todoItems: [] },
  { id: 2, username: "jane_smith", todoItems: [] },
  { id: 3, username: "alex_dev", todoItems: [] },
  { id: 4, username: "sarah_connor", todoItems: [] },
  { id: 5, username: "michael_scott", todoItems: [] },
  { id: 6, username: "emily_watson", todoItems: [] },
  { id: 7, username: "david_beckham", todoItems: [] },
  { id: 8, username: "lisa_simpson", todoItems: [] },
  { id: 9, username: "bruce_wayne", todoItems: [] },
  { id: 10, username: "clark_kent", todoItems: [] },
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

  return {
    id,
    title: `${template} (Phase ${batch})`,
    isCompleted,
    assigneeId,
  };
});
