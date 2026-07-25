import type { RefObject } from "react";
import type { VirtualItem } from "@tanstack/react-virtual";
import type { ToDoItem } from "@repo/shared";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Spinner,
  Checkbox,
} from "@repo/ui";
import { StatusBadge } from "./status-badge";
import { COL_SPAN } from "./constants";

export interface TodoTableViewProps {
  todos: ToDoItem[];
  total: number;
  mode: "global" | "user";
  virtualItems: VirtualItem[];
  paddingTop: number;
  paddingBottom: number;
  parentRef: RefObject<HTMLDivElement | null>;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetchingNextPage: boolean;
  // Global mode only
  usersMap?: Map<number, string>;
  // User mode only
  pendingChanges?: Record<number, boolean>;
  onToggle?: (id: number, serverIsCompleted: boolean) => void;
  onRowClick?: (todoId: number) => void;
}

export function TodoTableView({
  todos,
  total,
  mode,
  virtualItems,
  paddingTop,
  paddingBottom,
  parentRef,
  isPending,
  isError,
  errorMessage,
  isFetchingNextPage,
  usersMap,
  pendingChanges = {},
  onToggle,
  onRowClick,
}: TodoTableViewProps) {
  const colSpan = COL_SPAN[mode];

  return (
    <Card className="w-full border-border/80 shadow-sm overflow-hidden py-0 gap-0">
      {/* Card Header */}
      <CardHeader className="bg-slate-50/80 border-b border-border/60 px-5 py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">
          {mode === "global" ? "Active Task Registry" : "Active Assignments"}
        </CardTitle>
        <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Total: {total}
        </span>
      </CardHeader>

      {/* Virtualized Table */}
      <CardContent className="p-0">
        <div
          ref={parentRef}
          className="h-70 overflow-y-auto scrollbar-thin relative"
        >
          {isPending ? (
            <div className="h-full flex items-center justify-center p-8 text-muted-foreground gap-2">
              <Spinner className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium">Loading tasks...</span>
            </div>
          ) : isError ? (
            <div className="h-full flex items-center justify-center p-8 text-destructive text-sm font-medium">
              {errorMessage || "Failed to load tasks."}
            </div>
          ) : todos.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 text-muted-foreground text-sm font-medium">
              No tasks found.
            </div>
          ) : (
            <Table className="w-full border-collapse">
              <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 shadow-xs">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="w-16 px-4 text-xs font-mono font-semibold uppercase text-slate-500">
                    ID
                  </TableHead>
                  <TableHead className="px-4 text-xs font-mono font-semibold uppercase text-slate-500">
                    TASK TITLE
                  </TableHead>
                  <TableHead className="w-28 px-4 text-xs font-mono font-semibold uppercase text-slate-500">
                    STATUS
                  </TableHead>
                  {mode === "global" && (
                    <TableHead className="w-36 px-4 text-xs font-mono font-semibold uppercase text-slate-500">
                      ASSIGNEE
                    </TableHead>
                  )}
                  {mode === "user" && (
                    <TableHead className="w-20 px-4 text-xs font-mono font-semibold uppercase text-slate-500 text-center">
                      ACTION
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paddingTop > 0 && (
                  <tr style={{ height: `${paddingTop}px` }}>
                    <td colSpan={colSpan} />
                  </tr>
                )}
                {virtualItems.map((virtualRow) => {
                  const todo = todos[virtualRow.index];
                  if (!todo || todo.id === undefined) return null;

                  const isOptimistic = Boolean(todo.isOptimistic);

                  // Resolve effective completion: pending change overrides server value
                  const serverIsCompleted = todo.isCompleted ?? false;
                  const isPendingChange = todo.id in pendingChanges;
                  const effectiveIsCompleted = isPendingChange
                    ? pendingChanges[todo.id]
                    : serverIsCompleted;

                  return (
                    <TableRow
                      key={todo.id}
                      onClick={() => !isOptimistic && onRowClick?.(todo.id!)}
                      className={`h-[56px] border-b border-slate-100 transition-colors ${
                        isOptimistic
                          ? "opacity-60 cursor-not-allowed bg-slate-50/70"
                          : onRowClick
                          ? "hover:bg-slate-100/80 cursor-pointer"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* ID */}
                      <TableCell className="w-16 px-4 font-mono text-sm text-slate-500">
                        {isOptimistic ? (
                          <Spinner className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          todo.id
                        )}
                      </TableCell>

                      {/* Title */}
                      <TableCell className="px-4 text-sm font-medium text-slate-800">
                        <span
                          className={
                            mode === "user" && effectiveIsCompleted
                              ? "line-through text-slate-400"
                              : undefined
                          }
                        >
                          {todo.title}
                        </span>
                      </TableCell>

                      {/* Status badge — always reflects effective state */}
                      <TableCell className="w-28 px-4">
                        <StatusBadge isCompleted={effectiveIsCompleted} />
                      </TableCell>

                      {/* Assignee (global mode only) */}
                      {mode === "global" && (
                        <TableCell className="w-36 px-4 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                              {(
                                usersMap?.get(todo.assigneeId) || "U"
                              )
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <span>
                              {usersMap?.get(todo.assigneeId) ||
                                `User #${todo.assigneeId}`}
                            </span>
                          </div>
                        </TableCell>
                      )}

                      {/* Checkbox action (user mode only) */}
                      {mode === "user" && (
                        <TableCell className="w-20 px-4 text-center">
                          <Checkbox
                            checked={effectiveIsCompleted}
                            onCheckedChange={() =>
                              onToggle?.(todo.id!, serverIsCompleted)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr style={{ height: `${paddingBottom}px` }}>
                    <td colSpan={colSpan} />
                  </tr>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>
            Showing {todos.length} of {total} tasks
          </span>
          {isFetchingNextPage && (
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <Spinner className="w-3.5 h-3.5" /> Loading more...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
