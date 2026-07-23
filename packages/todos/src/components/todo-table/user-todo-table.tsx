import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ToDoItem } from "@repo/shared";
import { useTodoStatusEditContext } from "../../context/todo-status-edit-context";
import { TodoTableView } from "./todo-table-view";
import { ROW_HEIGHT } from "./constants";

export interface UserTodoTableProps {
  userId: number;
  todos: ToDoItem[];
  total: number;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function UserTodoTable({
  todos,
  total,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  isPending,
  isError,
  errorMessage,
}: UserTodoTableProps) {
  const { pendingChanges, toggleTodo } = useTodoStatusEditContext();

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
      mode="user"
      virtualItems={virtualItems}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      parentRef={parentRef}
      isPending={isPending}
      isError={isError}
      errorMessage={errorMessage}
      isFetchingNextPage={isFetchingNextPage}
      pendingChanges={pendingChanges}
      onToggle={toggleTodo}
    />
  );
}
