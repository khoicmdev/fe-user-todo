import { useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState, useEffect, type ReactNode } from "react";
import {
  Button,
  Input,
  Spinner,
} from "@repo/ui";
import { Save } from "lucide-react";
import { createUserDetailQueryAtom } from "../atoms/user-queries";

export interface UserDetailProps {
  createTodoFormSlot?: ReactNode;
  todoTableSlot?: ReactNode;
  hasTodoChanges?: boolean;
  isSaving?: boolean;
  onSave?: (username: string) => void;
}

export function UserDetail({
  createTodoFormSlot,
  todoTableSlot,
  hasTodoChanges = false,
  isSaving = false,
  onSave,
}: UserDetailProps) {
  const params = useParams({ from: "/users/$id" });
  const userId = Number(params.id);

  const userQueryAtom = createUserDetailQueryAtom(userId);
  const { data: user, isLoading, error } = useAtomValue(userQueryAtom);
  const [usernameInput, setUsernameInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setUsernameInput(user.username);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground gap-2">
        <Spinner className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium">Loading user details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center text-destructive text-sm font-medium">
        Error loading user details.
      </div>
    );
  }

  const hasUsernameChange = usernameInput !== user.username;
  const hasPendingChanges = hasUsernameChange || hasTodoChanges;

  const handleSave = () => {
    onSave?.(usernameInput);
    setIsEditing(false);
  };

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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User:</h1>
          {isEditing ? (
            <Input
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="h-10 text-lg font-medium bg-white w-64 border-indigo-400 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              title="Click to edit"
              className="text-2xl font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              {user.username}
            </span>
          )}
        </div>

        {/* Single Save button — saves username + todo changes together */}
        <Button
          onClick={handleSave}
          disabled={!hasPendingChanges || isSaving}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? (
            <>
              <Spinner className="w-4 h-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save{hasTodoChanges ? " Changes" : ""}
            </>
          )}
        </Button>
      </div>

      {/* Main Grid: Left Slot (Add ToDo) + Right Assignments Table */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Create ToDo Form Slot */}
        <div className="w-full">
          {createTodoFormSlot ?? (
            <div className="p-4 border border-dashed rounded-lg text-xs text-muted-foreground text-center">
              No Create ToDo slot provided
            </div>
          )}
        </div>

        {/* Right Column: Todo Table Slot */}
        <div className="w-full">
          {todoTableSlot ?? (
            <div className="p-4 border border-dashed rounded-lg text-xs text-muted-foreground text-center">
              No Todo Table slot provided
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
