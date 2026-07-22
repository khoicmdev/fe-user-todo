import { atomWithInfiniteQuery } from "jotai-tanstack-query";
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
