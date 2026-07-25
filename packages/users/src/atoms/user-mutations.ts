import { atomWithMutation, queryClientAtom } from "jotai-tanstack-query";
import type { InfiniteData } from "@tanstack/react-query";
import { toast } from "@repo/ui";
import type { User } from "@repo/shared";
import { API_BASE_URL, JSON_HEADERS } from "@repo/shared";
import { USERS_QUERY_KEY, type UsersResponse } from "./user-queries";

interface MutationContext {
  previousData?: InfiniteData<UsersResponse>;
  tempId?: number;
}

interface ServerErrorResponse {
  error?: string | { fieldErrors?: { username?: string[] } };
}

export const createUserMutationAtom = atomWithMutation<
  User,
  string,
  Error,
  MutationContext
>((get) => {
  const client = get(queryClientAtom);

  return {
    mutationFn: async (username: string): Promise<User> => {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ServerErrorResponse;
        const fieldError =
          typeof err?.error === "object" && err?.error?.fieldErrors?.username?.[0];
        const generalError = typeof err?.error === "string" ? err.error : null;
        throw new Error(fieldError || generalError || "Failed to create user");
      }

      return res.json() as Promise<User>;
    },
    onMutate: async (newUsername: string) => {
      await client.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousData =
        client.getQueryData<InfiniteData<UsersResponse>>(USERS_QUERY_KEY);

      const tempId = Date.now();
      const optimisticUser: User = {
        id: tempId,
        username: newUsername,
        todoItems: [],
        createdDate: new Date().toISOString(),
        isOptimistic: true,
      };

      client.setQueryData<InfiniteData<UsersResponse>>(
        USERS_QUERY_KEY,
        (old) => {
          if (!old || !old.pages || old.pages.length === 0) return old;
          const pages = [...old.pages];
          pages[0] = {
            ...pages[0],
            data: [optimisticUser, ...pages[0].data],
            total: (pages[0].total || 0) + 1,
          };
          return { ...old, pages };
        }
      );

      return { previousData, tempId };
    },
    onError: (err: Error, _newUsername, context) => {
      if (context?.previousData) {
        client.setQueryData(USERS_QUERY_KEY, context.previousData);
      }
      toast.error(err.message || "Failed to create user");
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic item with actual server response data
      client.setQueryData<InfiniteData<UsersResponse>>(
        USERS_QUERY_KEY,
        (old) => {
          if (!old || !old.pages) return old;
          const pages = old.pages.map((page) => ({
            ...page,
            data: page.data.map((user) =>
              user.id === context?.tempId ? data : user
            ),
          }));
          return { ...old, pages };
        }
      );

      client.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`User "${data.username}" created successfully!`);
    },
  };
});

// --- Update user mutation (username + optional todo status batch update) ---

export interface UpdateUserInput {
  userId: number;
  username?: string;
  todoUpdates?: { id: number; isCompleted: boolean }[];
}

export const updateUserMutationAtom = atomWithMutation<
  User,
  UpdateUserInput,
  Error
>((get) => {
  const client = get(queryClientAtom);

  return {
    mutationFn: async ({ userId, username, todoUpdates }: UpdateUserInput): Promise<User> => {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PATCH",
        headers: JSON_HEADERS,
        body: JSON.stringify({ username, todoUpdates }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ServerErrorResponse;
        const generalError = typeof err?.error === "string" ? err.error : null;
        throw new Error(generalError || "Failed to update user");
      }

      return res.json() as Promise<User>;
    },
    onSuccess: (data, { userId }) => {
      // Invalidate user list, the specific user detail, and todos cache
      client.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      client.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, userId] });
      client.invalidateQueries({ queryKey: ["todos"] });
      toast.success(`Saved changes for "${data.username}"`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save changes");
    },
  };
});

// --- Delete user mutation ---

export const deleteUserMutationAtom = atomWithMutation<
  void,
  number,
  Error
>((get) => {
  const client = get(queryClientAtom);

  return {
    mutationFn: async (userId: number): Promise<void> => {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ServerErrorResponse;
        const generalError = typeof err?.error === "string" ? err.error : null;
        throw new Error(generalError || "Failed to delete user");
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      client.invalidateQueries({ queryKey: ["todos"] });
      toast.success("User and associated tasks deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user");
    },
  };
});
