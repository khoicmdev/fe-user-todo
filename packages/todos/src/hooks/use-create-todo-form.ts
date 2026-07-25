import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAtomValue } from "jotai";
import { createTodoMutationAtom } from "../atoms/todo-mutations";

export const createTodoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(250, "Task title cannot exceed 250 characters."),
  assigneeId: z.number().min(1, "Please select an assignee."),
});

export type CreateTodoFormValues = z.infer<typeof createTodoFormSchema>;

export interface UseCreateTodoFormOptions {
  fixedAssigneeId?: number;
  fixedAssigneeName?: string;
  onSuccess?: () => void;
}

export function useCreateTodoForm(options: UseCreateTodoFormOptions = {}) {
  const { fixedAssigneeId, fixedAssigneeName, onSuccess } = options;

  const {
    register,
    control,
    handleSubmit,
    reset: rhfReset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateTodoFormValues>({
    resolver: zodResolver(createTodoFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      assigneeId: fixedAssigneeId ?? 0,
    },
  });

  const { mutate, isPending, isError, isSuccess, error, reset: mutationReset } =
    useAtomValue(createTodoMutationAtom);

  const selectedAssigneeId = watch("assigneeId");
  const isAssigneeLocked = Boolean(fixedAssigneeId);

  // Sync fixedAssigneeId if prop changes
  useEffect(() => {
    if (
      typeof fixedAssigneeId === "number" &&
      selectedAssigneeId !== fixedAssigneeId
    ) {
      setValue("assigneeId", fixedAssigneeId, { shouldValidate: true });
    }
  }, [fixedAssigneeId, selectedAssigneeId, setValue]);

  // Reset form upon successful task creation and notify callback
  useEffect(() => {
    if (isSuccess) {
      rhfReset({
        title: "",
        assigneeId: fixedAssigneeId ?? selectedAssigneeId ?? 0,
      });
      mutationReset();
      onSuccess?.();
    }
  }, [isSuccess, rhfReset, fixedAssigneeId, selectedAssigneeId, mutationReset, onSuccess]);

  const onSubmit = (data: CreateTodoFormValues) => {
    if (isPending) return;

    mutate({
      title: data.title,
      assigneeId: fixedAssigneeId || data.assigneeId,
    });
  };

  return {
    register,
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isValid,
    isAssigneeLocked,
    fixedAssigneeName,
    selectedAssigneeId: fixedAssigneeId || selectedAssigneeId,
    isPending,
    isError,
    isSuccess,
    error,
    resetMutation: mutationReset,
  };
}
