import { atomWithMutation, queryClientAtom } from "jotai-tanstack-query";
import { toast } from "@repo/ui";
import type { ToDoItem } from "@repo/shared";
import { API_BASE_URL, JSON_HEADERS } from "@repo/shared";
import { TODOS_QUERY_KEY } from "./todo-queries";

export type CreateTodoInput = Pick<ToDoItem, "title" | "assigneeId">;

// --- Create todo mutation ---
export const createTodoMutationAtom = atomWithMutation<
  ToDoItem,
  CreateTodoInput,
  Error
>((get) => {
  const client = get(queryClientAtom);

  return {
    mutationFn: async (input: CreateTodoInput): Promise<ToDoItem> => {
      const res = await fetch(`${API_BASE_URL}/api/todos`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = typeof err?.error === "string" ? err.error : "Failed to create task";
        throw new Error(message);
      }

      return res.json() as Promise<ToDoItem>;
    },
    onSuccess: (data) => {
      // Invalidate both global todos and users query cache so active assignment tables update
      client.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      client.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Task "${data.title}" created successfully!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create task");
    },
  };
});

// --- Update todo mutation (title + isCompleted) ---

export interface UpdateTodoInput {
  todoId: number;
  title?: string;
  isCompleted?: boolean;
}

export const updateTodoMutationAtom = atomWithMutation<
  ToDoItem,
  UpdateTodoInput,
  Error
>((get) => {
  const client = get(queryClientAtom);

  return {
    mutationFn: async ({ todoId, title, isCompleted }: UpdateTodoInput): Promise<ToDoItem> => {
      const res = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ title, isCompleted }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = typeof err?.error === "string" ? err.error : "Failed to update task";
        throw new Error(message);
      }

      return res.json() as Promise<ToDoItem>;
    },
    onSuccess: (data, { todoId }) => {
      client.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      client.invalidateQueries({ queryKey: [...TODOS_QUERY_KEY, todoId] });
      client.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Task "${data.title}" updated successfully!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update task");
    },
  };
});
