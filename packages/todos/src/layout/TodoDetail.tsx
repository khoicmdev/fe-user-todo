import { useEffect, useState } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Checkbox, Input, Label, Spinner } from "@repo/ui";
import { ConfirmDialog, API_BASE_URL } from "@repo/shared";
import { Save, X, User, ArrowLeft, Trash2 } from "lucide-react";
import { createTodoDetailQueryAtom } from "../atoms/todo-queries";
import { updateTodoMutationAtom, deleteTodoMutationAtom } from "../atoms/todo-mutations";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const todoDetailSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task name is required.")
    .max(250, "Task name cannot exceed 250 characters."),
  isCompleted: z.boolean(),
});

type TodoDetailFormValues = z.infer<typeof todoDetailSchema>;

// ---------------------------------------------------------------------------
// Assignee sub-component — direct fetch to avoid cross-package dependency
// ---------------------------------------------------------------------------
function AssigneeField({ assigneeId }: { assigneeId: number }) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/users/${assigneeId}`)
      .then((r) => r.json())
      .then((u) => setUsername(u?.username ?? null))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, [assigneeId]);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wide">
        Assignee
      </Label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={loading ? "Loading..." : (username ?? `User #${assigneeId}`)}
          disabled
          className="pl-9 bg-slate-100 text-slate-600 cursor-not-allowed font-medium border-slate-200"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TodoDetail — main component
// ---------------------------------------------------------------------------
export function TodoDetail() {
  const params = useParams({ strict: false });
  const todoId = Number((params as Record<string, string>).id);
  const router = useRouter();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const todoQueryAtom = createTodoDetailQueryAtom(todoId);
  const { data: todo, isLoading, error } = useAtomValue(todoQueryAtom);

  const { mutate: updateTodo, isPending: isSaving } = useAtomValue(updateTodoMutationAtom);
  const { mutate: deleteTodo, isPending: isDeleting } = useAtomValue(deleteTodoMutationAtom);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<TodoDetailFormValues>({
    resolver: zodResolver(todoDetailSchema),
    mode: "onChange",
    defaultValues: { title: "", isCompleted: false },
  });

  useEffect(() => {
    if (todo) {
      reset({ title: todo.title, isCompleted: todo.isCompleted ?? false });
    }
  }, [todo, reset]);

  // ---- Loading state -------------------------------------------------------
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground gap-2">
        <Spinner className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium">Loading task details...</span>
      </div>
    );
  }

  // ---- Error state ---------------------------------------------------------
  if (error || !todo) {
    return (
      <div className="p-8 text-center text-destructive text-sm font-medium">
        Error loading task details.
      </div>
    );
  }

  // ---- Handlers ------------------------------------------------------------
  const onSubmit = (data: TodoDetailFormValues) => {
    updateTodo({ todoId, title: data.title, isCompleted: data.isCompleted });
  };

  const handleCancel = () => {
    router.history.back();
  };

  const handleDeleteConfirm = () => {
    deleteTodo(todoId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        handleCancel();
      },
      onError: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  const isCompleted = watch("isCompleted");

  const createdDate = todo.createdDate
    ? new Date(todo.createdDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // ---- Render --------------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 flex flex-col gap-6">
      {/* Top Navigation & Metadata Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCancel}
          aria-label="Go Back"
          className="h-8 w-8 text-slate-600 border-slate-300 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-md border border-indigo-100">
            TASK_ID: {todo.id}
          </span>
          <span>🕒 Created: {createdDate}</span>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl bg-white rounded-xl border border-border/80 shadow-sm p-6 flex flex-col gap-6"
      >
        {/* Task Name */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="todo-title"
            className="text-xs font-mono font-semibold uppercase text-slate-500 tracking-wide"
          >
            Task Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="todo-title"
            {...register("title")}
            maxLength={250}
            placeholder="Enter task name..."
            className={`text-lg font-medium border-slate-300 focus:ring-2 focus:ring-indigo-500 ${
              errors.title ? "border-destructive focus:ring-destructive" : ""
            }`}
          />
          {errors.title && (
            <span className="text-xs text-destructive font-medium">
              {errors.title.message}
            </span>
          )}
        </div>

        {/* Mark as complete checkbox */}
        <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100/60 transition-colors">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={(checked) =>
              setValue("isCompleted", Boolean(checked), { shouldDirty: true })
            }
            className="cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-700">
            Mark task as complete
          </span>
        </label>

        {/* Assignee (always disabled) */}
        {todo.assigneeId !== undefined && (
          <AssigneeField assigneeId={todo.assigneeId} />
        )}

        {/* Metadata row */}
        <div className="flex items-start justify-between pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wide">
              Task ID
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-sm font-semibold">
              {todo.id}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wide">
              Created Date
            </span>
            <span className="text-sm font-semibold text-slate-700">{createdDate}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium shadow-xs border border-red-700/20"
          >
            {isDeleting ? (
              <>
                <Spinner className="w-4 h-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Task
              </>
            )}
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || !isValid || isSaving || isDeleting}
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
                Save
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete task "${todo.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
