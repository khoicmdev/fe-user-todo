import { useRef, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppNavigate } from "@repo/shared";
import { usersInfiniteQueryAtom, selectedUserIdAtom } from "../atoms/user-atoms";
import { UserTableView } from "./user-table-view";

const ROW_HEIGHT = 56;

/**
 * UserTable Container Component.
 * Handles data fetching (Jotai usersInfiniteQueryAtom), scroll virtualization calculations,
 * and page fetching side effects, passing state down to UserTableView.
 */
export function UserTable() {
  const navigate = useAppNavigate();
  const setSelectedUserId = useSetAtom(selectedUserIdAtom);
  const [queryResult] = useAtom(usersInfiniteQueryAtom);

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    navigate({ to: "/users/$id", params: { id: String(userId) } });
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = queryResult;

  const parentRef = useRef<HTMLDivElement>(null);

  const users = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? users.length;

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  // Scroll detection for fetching next page
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= users.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, users.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <UserTableView
      users={users}
      total={total}
      virtualItems={virtualItems}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      parentRef={parentRef}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
      isFetchingNextPage={isFetchingNextPage}
      onUserClick={handleUserClick}
    />
  );
}