import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { CheckCircle2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useCreateTodoForm, type UseCreateTodoFormOptions } from "../hooks/use-create-todo-form";
import { UserSelectCombobox } from "./user-select-combobox";

export interface CreateTodoFormProps extends UseCreateTodoFormOptions {
  className?: string;
  submitButtonText?: string;
}

export function CreateTodoForm(props: CreateTodoFormProps) {
  const { className, submitButtonText } = props;

  const {
    register,
    control,
    handleSubmit,
    errors,
    isValid,
    selectedAssigneeId,
    fixedAssigneeName,
    isAssigneeLocked,
    isPending,
    isError,
    isSuccess,
    error,
    resetMutation,
  } = useCreateTodoForm(props);

  return (
    <Card className={`w-full border-border/80 shadow-sm overflow-hidden py-0 gap-0 ${className || ""}`}>
      {/* Card Header */}
      <CardHeader className="bg-slate-50/80 border-b border-border/60 px-5 py-4 flex flex-row items-center gap-3 space-y-0">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
        <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">
          {isAssigneeLocked ? "Add ToDo" : "Create ToDo"}
        </CardTitle>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Task Title Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="todo-title" className="text-xs font-medium text-slate-700">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="todo-title"
              type="text"
              placeholder={isAssigneeLocked ? "e.g. Optimize SQL query" : "What needs to be done..."}
              disabled={isPending}
              {...register("title", {
                onChange: () => {
                  if (isError || isSuccess) resetMutation();
                },
              })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Assignee Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee-select" className="text-xs font-medium text-slate-700">
              {isAssigneeLocked ? "Assigned To" : "Assignee"} <span className="text-destructive">*</span>
            </Label>

            {isAssigneeLocked ? (
              <Input
                id="assignee-select"
                type="text"
                value={fixedAssigneeName || `User #${selectedAssigneeId}`}
                disabled
                className="bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
              />
            ) : (
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <UserSelectCombobox
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      if (isError || isSuccess) resetMutation();
                    }}
                    disabled={isPending}
                  />
                )}
              />
            )}
            {errors.assigneeId && !isAssigneeLocked && (
              <p className="text-xs text-destructive">{errors.assigneeId.message}</p>
            )}
          </div>

          {/* Error Message Feedback */}
          {isError && error instanceof Error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium">
              {error.message}
            </div>
          )}

          {/* Success Message Feedback */}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              Task created successfully!
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            {isPending
              ? "Creating..."
              : submitButtonText || (isAssigneeLocked ? "Create Task" : "PROVISION TASK")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
