import { useAtomValue } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import type { ToDoItem, User } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { CreateTodoForm } from "../components/create-todo-form";
import { TODOS_QUERY_KEY } from "../atoms/todo-atoms";
import { SlidersHorizontal, Download } from "lucide-react";

export function TodosPage() {
  // Fetch global todos list
  const todosQueryAtom = atomWithQuery<ToDoItem[]>(() => ({
    queryKey: TODOS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/todos`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      return res.json() as Promise<ToDoItem[]>;
    },
  }));

  // Fetch users list for rendering assignee usernames in table
  const usersQueryAtom = atomWithQuery<{ data: User[] }>(() => ({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/users?pageIndex=1`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  }));

  const { data: todos = [], isLoading } = useAtomValue(todosQueryAtom);
  const { data: usersData } = useAtomValue(usersQueryAtom);
  const usersMap = new Map((usersData?.data || []).map((u) => [u.id, u.username]));

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Global Task Board</h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified view of all system-wide synchronization tasks and assignments. Optimized for large-scale operations.
        </p>
      </div>

      {/* Grid: Left Task Registry Table + Right Create ToDo Form */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left Column: Active Task Registry Table */}
        <Card className="w-full border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">
              Active Task Registry
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading task registry...</div>
            ) : todos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>TASK TITLE</TableHead>
                    <TableHead className="w-32">STATUS</TableHead>
                    <TableHead className="w-40">ASSIGNEE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todos.slice(0, 15).map((todo) => (
                    <TableRow key={todo.id}>
                      <TableCell className="font-mono text-xs text-indigo-600 font-semibold">
                        #TSK-{todo.id}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 text-xs">
                        {todo.title}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            todo.isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {todo.isCompleted ? "COMPLETED" : "PENDING"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {(usersMap.get(todo.assigneeId) || "User").slice(0, 2).toUpperCase()}
                          </span>
                          <span>{usersMap.get(todo.assigneeId) || `User #${todo.assigneeId}`}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No task registry records found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Create ToDo Form (Selectable Assignee Mode) */}
        <div className="w-full">
          <CreateTodoForm />
        </div>
      </div>
    </div>
  );
}
