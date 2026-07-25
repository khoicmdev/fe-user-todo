import { atomWithMutation, queryClientAtom } from "jotai-tanstack-query";
import type { InfiniteData } from "@tanstack/react-query";
import { toast } from "@repo/ui";
import type { ToDoItem } from "@repo/shared";
import { API_BASE_URL, JSON_HEADERS } from "@repo/shared";
import { TODOS_QUERY_KEY, type TodosResponse } from "./todo-queries";

export type CreateTodoInput = Pick<ToDoItem, "title" | "assigneeId">;

interface CreateTodoMutationContext {
  previousData?: InfiniteData<TodosResponse>;
  previousUserData?: InfiniteData<TodosResponse>;
  userQueryKey?: readonly [...typeof TODOS_QUERY_KEY, "user", number];
}

// --- Create todo mutation ---
export const createTodoMutationAtom = atomWithMutation<
  ToDoItem,
  CreateTodoInput,
  Error,
  CreateTodoMutationContext
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
    onMutate: async (input: CreateTodoInput) => {
      await client.cancelQueries({ queryKey: TODOS_QUERY_KEY });

      const userQueryKey = [...TODOS_QUERY_KEY, "user", input.assigneeId] as const;

      const previousData =
        client.getQueryData<InfiniteData<TodosResponse>>(TODOS_QUERY_KEY);
      const previousUserData =
        client.getQueryData<InfiniteData<TodosResponse>>(userQueryKey);

      const optimisticTodo: ToDoItem = {
        id: Date.now(),
        title: input.title,
        isCompleted: false,
        assigneeId: input.assigneeId,
        createdDate: new Date().toISOString(),
      };

      client.setQueryData<InfiniteData<TodosResponse>>(
        TODOS_QUERY_KEY,
        (old) => {
          if (!old || !old.pages || old.pages.length === 0) return old;
          const pages = [...old.pages];
          pages[0] = {
            ...pages[0],
            data: [optimisticTodo, ...pages[0].data],
            total: (pages[0].total || 0) + 1,
          };
          return { ...old, pages };
        }
      );

      if (previousUserData) {
        client.setQueryData<InfiniteData<TodosResponse>>(
          userQueryKey,
          (old) => {
            if (!old || !old.pages || old.pages.length === 0) return old;
            const pages = [...old.pages];
            pages[0] = {
              ...pages[0],
              data: [optimisticTodo, ...pages[0].data],
              total: (pages[0].total || 0) + 1,
            };
            return { ...old, pages };
          }
        );
      }

      return { previousData, previousUserData, userQueryKey };
    },
    onError: (err: Error, _input, context) => {
      if (context?.previousData) {
        client.setQueryData(TODOS_QUERY_KEY, context.previousData);
      }
      if (context?.previousUserData && context?.userQueryKey) {
        client.setQueryData(context.userQueryKey, context.previousUserData);
      }
      toast.error(err.message || "Failed to create task");
    },
    onSuccess: (data) => {
      // Invalidate both global todos and users query cache so active assignment tables update
      client.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      client.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Task "${data.title}" created successfully!`);
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
