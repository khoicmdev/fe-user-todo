import { useParams, useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Spinner,
} from "@repo/ui";
import { Save, X } from "lucide-react";
import { createUserDetailQueryAtom } from "../atoms/user-queries";
import { selectedUserIdAtom } from "../atoms/user-ui-atoms";

const userDetailSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .max(250, "Username cannot exceed 250 characters."),
});

type UserDetailFormValues = z.infer<typeof userDetailSchema>;

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
  const params = useParams({ strict: false });
  const userId = Number((params as Record<string, string>).id);
  const navigate = useNavigate();
  const setSelectedUserId = useSetAtom(selectedUserIdAtom);

  const userQueryAtom = createUserDetailQueryAtom(userId);
  const { data: user, isLoading, error } = useAtomValue(userQueryAtom);

  useEffect(() => {
    if (Number.isFinite(userId)) {
      setSelectedUserId(userId);
    }
  }, [userId, setSelectedUserId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<UserDetailFormValues>({
    resolver: zodResolver(userDetailSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({ username: user.username });
    }
  }, [user, reset]);

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

  const hasPendingChanges = (isDirty || hasTodoChanges) && isValid;

  const onSubmit = (data: UserDetailFormValues) => {
    onSave?.(data.username);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full min-h-screen bg-slate-50 p-6 flex flex-col gap-6"
    >
      {/* Top Metadata Bar */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-100">
          UID: user_0x7F{user.id}
        </span>
        <span>🕒 Last active: 2m ago</span>
      </div>

      {/* User Header & Edit Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <label htmlFor="user-detail-username" className="text-2xl font-bold text-slate-800 tracking-tight cursor-pointer">User:</label>
            <Input
              id="user-detail-username"
              {...register("username")}
              maxLength={250}
              placeholder="Enter username..."
              className={`h-10 text-lg font-medium bg-white w-64 border-indigo-400 focus:ring-2 focus:ring-indigo-500 ${
                errors.username ? "border-destructive focus:ring-destructive" : ""
              }`}
            />
          </div>
          {errors.username && (
            <span className="text-xs text-destructive font-medium pl-[88px]">
              {errors.username.message}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/users" })}
            className="gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!hasPendingChanges || !isValid || isSaving}
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
    </form>
  );
}
