import { useAtomValue } from "jotai";
import { createUserTodosQueryAtom } from "../../atoms/todo-queries";
import { UserTodoTable } from "./user-todo-table";

export function UserTodoTableFetcher({ userId }: { userId: number }) {
  const queryAtom = createUserTodosQueryAtom(userId);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useAtomValue(queryAtom);

  const todos = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? todos.length;

  return (
    <UserTodoTable
      userId={userId}
      todos={todos}
      total={total}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isPending={isPending}
      isError={isError}
      errorMessage={error?.message}
    />
  );
}
