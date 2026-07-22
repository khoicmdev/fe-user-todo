import { useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { useState, useEffect, type ReactNode } from "react";
import type { User } from "@repo/shared";
import { API_BASE_URL } from "@repo/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { SlidersHorizontal, RotateCw, CheckCircle2, Clock } from "lucide-react";

export interface UserDetailProps {
  createTodoFormSlot?: ReactNode;
}

export function UserDetail({ createTodoFormSlot }: UserDetailProps) {
  const params = useParams({ from: "/users/$id" });
  const userId = Number(params.id);

  // Single user query
  const userQueryAtom = atomWithQuery<User>(() => ({
    queryKey: ["users", userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json() as Promise<User>;
    },
  }));

  const { data: user, isLoading, error } = useAtomValue(userQueryAtom);
  const [usernameInput, setUsernameInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setUsernameInput(user.username);
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading user details...</div>;
  }

  if (error || !user) {
    return <div className="p-8 text-center text-destructive">Error loading user details.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 flex flex-col gap-6">
      {/* Top Metadata Bar */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-100">
          UID: user_0x7F{user.id}
        </span>
        <span>🕒 Last active: 2m ago</span>
      </div>

      {/* User Header & Edit Bar */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User:</h1>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="h-10 text-lg font-medium bg-white w-64 border-indigo-400 focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setIsEditing(false)}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUsernameInput(user.username);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span
              onClick={() => setIsEditing(true)}
              className="text-2xl font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              {user.username}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Slot (Add ToDo) + Right Active Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Create ToDo Form Slot passed from Composition Root */}
        <div className="w-full">
          {createTodoFormSlot || (
            <div className="p-4 border border-dashed rounded-lg text-xs text-muted-foreground text-center">
              No Create ToDo slot provided
            </div>
          )}
        </div>

        {/* Right Column: Active Assignments Table */}
        <Card className="w-full border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Active Assignments
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Showing tasks assigned to <span className="font-semibold text-slate-700">{user.username}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <RotateCw className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {user.todoItems && user.todoItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>TASK DESCRIPTION</TableHead>
                    <TableHead className="w-32">STATUS</TableHead>
                    <TableHead className="w-24 text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.todoItems.map((todo) => (
                    <TableRow key={todo.id}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        #{todo.id}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          {todo.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span>{todo.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            todo.isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {todo.isCompleted ? "Completed" : "In Progress"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400">
                        —
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No active tasks assigned to this user yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
