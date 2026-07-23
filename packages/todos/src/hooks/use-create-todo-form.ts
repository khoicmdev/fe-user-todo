import { useAtomValue } from "jotai";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createTodoMutationAtom } from "../atoms/todo-mutations";

export interface UseCreateTodoFormOptions {
  fixedAssigneeId?: number;
  fixedAssigneeName?: string;
  onSuccess?: () => void;
}

export function useCreateTodoForm(options: UseCreateTodoFormOptions = {}) {
  const { fixedAssigneeId, fixedAssigneeName, onSuccess } = options;

  const [title, setTitle] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number>(
    fixedAssigneeId || 0
  );

  const { mutate, isPending, isError, isSuccess, error, reset } =
    useAtomValue(createTodoMutationAtom);

  // Sync selectedAssigneeId if fixedAssigneeId prop changes
  useEffect(() => {
    if (typeof fixedAssigneeId === "number") {
      setSelectedAssigneeId(fixedAssigneeId);
    }
  }, [fixedAssigneeId]);

  const trimmedTitle = title.trim();
  const effectiveAssigneeId = fixedAssigneeId || selectedAssigneeId;
  const isValid = trimmedTitle.length > 0 && effectiveAssigneeId > 0;

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isError || isSuccess) reset();
  };

  const handleAssigneeChange = (value: number) => {
    setSelectedAssigneeId(value);
    if (isError || isSuccess) reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isPending) return;

    mutate(
      {
        title: trimmedTitle,
        assigneeId: effectiveAssigneeId,
      },
      {
        onSuccess: () => {
          setTitle("");
          onSuccess?.();
        },
      }
    );
  };

  return {
    title,
    selectedAssigneeId: effectiveAssigneeId,
    fixedAssigneeName,
    isAssigneeLocked: Boolean(fixedAssigneeId),
    isPending,
    isError,
    isSuccess,
    error,
    isValid,
    handleTitleChange,
    handleAssigneeChange,
    handleSubmit,
  };
}
