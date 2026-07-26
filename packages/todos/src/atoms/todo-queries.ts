import { atom } from "jotai";
import { atomWithInfiniteQuery, atomWithQuery } from "jotai-tanstack-query";
import type { ToDoItem } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";

export const TODOS_QUERY_KEY = ["todos"] as const;

export interface TodosResponse {
  data: ToDoItem[];
  total: number;
  pageIndex: number;
}

const TODO_PAGE_SIZE = 10;

// --- Global todo user filter state ---
export const globalTodoUserIdFilterAtom = atom<number | undefined>(undefined);

// --- Global todos infinite query (for TodosPage) ---
export const todosInfiniteQueryAtom = atomWithInfiniteQuery<TodosResponse>((get) => {
  const userId = get(globalTodoUserIdFilterAtom);
  const queryKey =
    userId !== undefined
      ? [...TODOS_QUERY_KEY, "filter", userId]
      : [...TODOS_QUERY_KEY];

  return {
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const url = new URL(`${API_BASE_URL}/api/todos`);
      url.searchParams.set("pageIndex", String(pageParam));
      if (userId !== undefined) {
        url.searchParams.set("userId", String(userId));
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch todos");
      return res.json() as Promise<TodosResponse>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / TODO_PAGE_SIZE);
      return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
    },
  };
});

// --- User-scoped todos infinite query factory (for TodoTable mode="user") ---
export function createUserTodosQueryAtom(userId: number) {
  return atomWithInfiniteQuery<TodosResponse>(() => ({
    queryKey: [...TODOS_QUERY_KEY, "user", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${API_BASE_URL}/api/todos?userId=${userId}&pageIndex=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch user todos");
      return res.json() as Promise<TodosResponse>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / TODO_PAGE_SIZE);
      return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
    },
  }));
}

// --- Single todo detail query factory (for TodoDetail page) ---
export function createTodoDetailQueryAtom(todoId: number) {
  return atomWithQuery<ToDoItem>(() => ({
    queryKey: [...TODOS_QUERY_KEY, todoId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/todos/${todoId}`);
      if (!res.ok) throw new Error("Failed to fetch todo details");
      return res.json() as Promise<ToDoItem>;
    },
  }));
}
