import { useAtomValue } from "jotai";
import { atomWithInfiniteQuery } from "jotai-tanstack-query";
import type { User } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";

export interface UsersResponse {
  data: User[];
  total: number;
  pageIndex: number;
}

const userSelectInfiniteQueryAtom = atomWithInfiniteQuery<UsersResponse>(() => ({
  queryKey: ["user-select-infinite"],
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

export function useUserSelectInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useAtomValue(userSelectInfiniteQueryAtom);

  const users = data?.pages.flatMap((page) => page.data) || [];

  return {
    users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}
