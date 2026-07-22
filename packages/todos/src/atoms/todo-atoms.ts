import { atomWithMutation, queryClientAtom } from "jotai-tanstack-query";
import { toast } from "@repo/ui";
import type { ToDoItem } from "@repo/shared";
import { API_BASE_URL, JSON_HEADERS } from "@repo/shared";

export const TODOS_QUERY_KEY = ["todos"] as const;

export type CreateTodoInput = Pick<ToDoItem, "title" | "assigneeId">;

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
