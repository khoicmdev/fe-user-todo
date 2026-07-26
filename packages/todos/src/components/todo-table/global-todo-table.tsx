import { useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "@tanstack/react-router";
import { todosInfiniteQueryAtom, globalTodoUserIdFilterAtom } from "../../atoms/todo-queries";
import { useUserSelectInfinite } from "../../hooks/use-user-select-infinite";
import { TodoTableView } from "./todo-table-view";
import { ROW_HEIGHT } from "./constants";

export function GlobalTodoTable() {
  const navigate = useNavigate();
  const nav = navigate;
  const [userIdFilter, setUserIdFilter] = useAtom(globalTodoUserIdFilterAtom);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useAtomValue(todosInfiniteQueryAtom);

  const { users } = useUserSelectInfinite();
  const usersMap = new Map(
    users.filter((u): u is typeof u & { id: number } => u.id !== undefined)
      .map((u) => [u.id, u.username])
  );

  const todos = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? todos.length;

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: todos.length,
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

  const handleFilterChange = (id: number | undefined) => {
    setUserIdFilter(id);
    if (parentRef.current) {
      parentRef.current.scrollTo({ top: 0 });
    }
  };

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    if (lastItem.index >= todos.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, todos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <TodoTableView
      todos={todos}
      total={total}
      mode="global"
      virtualItems={virtualItems}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      parentRef={parentRef}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
      isFetchingNextPage={isFetchingNextPage}
      usersMap={usersMap}
      userIdFilter={userIdFilter}
      onUserIdFilterChange={handleFilterChange}
      onRowClick={(id) => nav({ to: "/todos/$id", params: { id: String(id) } })}
    />
  );
}
