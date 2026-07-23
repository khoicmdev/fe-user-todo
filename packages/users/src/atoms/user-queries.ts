import { atomWithInfiniteQuery, atomWithQuery } from "jotai-tanstack-query";
import type { User } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";

export const USERS_QUERY_KEY = ["users"] as const;

export interface UsersResponse {
  data: User[];
  total: number;
  pageIndex: number;
}

export const usersInfiniteQueryAtom = atomWithInfiniteQuery<UsersResponse>(() => ({
  queryKey: USERS_QUERY_KEY,
  queryFn: async ({ pageParam = 1 }) => {
    const res = await fetch(`${API_BASE_URL}/api/users?pageIndex=${pageParam}`);
    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }
    return res.json() as Promise<UsersResponse>;
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    const totalPages = Math.ceil(lastPage.total / 10);
    return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
  },
}));

export function createUserDetailQueryAtom(userId: number) {
  return atomWithQuery<User>(() => ({
    queryKey: [...USERS_QUERY_KEY, userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json() as Promise<User>;
    },
  }));
}

