import { atomWithMutation } from "jotai-tanstack-query";
import type { User } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";

/**
 * Mutation atom for POST /api/users.
 *
 * atomWithMutation returns a READ-ONLY atom — the `mutate` function is
 * embedded inside the atom value itself (result.mutate), not as the setter.
 * Use `useAtomValue(createUserMutationAtom)` in components to get full access
 * to: isPending, isError, isSuccess, data, error, reset, mutate.
 *
 * NOTE: onSuccess cache invalidation for ['users'] query key is deferred until
 * the user table is implemented with atomWithQuery — see Future Improvement
 * in implementation_plan.md.
 */
export const createUserMutationAtom = atomWithMutation<User, string>(() => ({
  mutationFn: async (username: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const fieldError = err?.error?.fieldErrors?.username?.[0];
      const generalError = typeof err?.error === "string" ? err.error : null;
      throw new Error(fieldError || generalError || "Failed to create user");
    }

    return res.json() as Promise<User>;
  },
}));
