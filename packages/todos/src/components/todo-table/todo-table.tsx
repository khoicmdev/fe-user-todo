import { GlobalTodoTable } from "./global-todo-table";
import { UserTodoTableFetcher } from "./user-todo-table-fetcher";

export type TodoTableProps =
  | { mode: "global" }
  | { mode: "user"; userId: number };

export function TodoTable(props: TodoTableProps) {
  if (props.mode === "global") {
    return <GlobalTodoTable />;
  }
  return <UserTodoTableFetcher userId={props.userId} />;
}
