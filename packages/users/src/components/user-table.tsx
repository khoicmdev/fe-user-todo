import React, { useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
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
} from "@repo/ui";
import { usersInfiniteQueryAtom } from "../atoms/user-atoms";

const ROW_HEIGHT = 56;

export function UserTable() {
  const [queryResult] = useAtom(usersInfiniteQueryAtom);
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
    <Card className="w-full border-border/80 shadow-sm overflow-hidden py-0 gap-0">
      {/* Card Header */}
      <CardHeader className="bg-slate-50/80 border-b border-border/60 px-5 py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">
          Registered Entities
        </CardTitle>
        <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Total: {total}
        </span>
      </CardHeader>

      {/* Table & Virtualized Scroll Area (Height for 5 items: 5 * 56px = 280px) */}
      <CardContent className="p-0">
        <div
          ref={parentRef}
          className="h-[280px] overflow-y-auto scrollbar-thin relative"
        >
          {isPending ? (
            <div className="h-full flex items-center justify-center p-8 text-muted-foreground gap-2">
              <Spinner className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium">Loading users...</span>
            </div>
          ) : isError ? (
            <div className="h-full flex items-center justify-center p-8 text-destructive text-sm font-medium">
              {error?.message || "Failed to load users."}
            </div>
          ) : users.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8 text-muted-foreground text-sm font-medium">
              No users found.
            </div>
          ) : (
            <Table className="w-full border-collapse">
              <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 shadow-xs">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="w-[140px] px-5 text-xs font-mono font-semibold uppercase text-slate-500">
                    SYSTEM_ID
                  </TableHead>
                  <TableHead className="px-5 text-xs font-mono font-semibold uppercase text-slate-500">
                    IDENT_USERNAME
                  </TableHead>
                  <TableHead className="w-[140px] px-5 text-right text-xs font-mono font-semibold uppercase text-slate-500">
                    TODO_COUNT
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paddingTop > 0 && (
                  <tr style={{ height: `${paddingTop}px` }}>
                    <td colSpan={3} />
                  </tr>
                )}
                {virtualItems.map((virtualRow) => {
                  const user = users[virtualRow.index];
                  if (!user) return null;

                  const todoCount = user.todoItems?.length ?? 0;

                  return (
                    <TableRow
                      key={user.id ?? virtualRow.index}
                      className="h-[56px] border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <TableCell className="w-[140px] px-5 font-mono text-sm font-medium text-indigo-600">
                        {user.id}
                      </TableCell>
                      <TableCell className="px-5 font-mono text-sm font-semibold text-slate-800 truncate">
                        {user.username}
                      </TableCell>
                      <TableCell className="w-[140px] px-5 text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {todoCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr style={{ height: `${paddingBottom}px` }}>
                    <td colSpan={3} />
                  </tr>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>
            Showing {users.length} of {total} entities
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