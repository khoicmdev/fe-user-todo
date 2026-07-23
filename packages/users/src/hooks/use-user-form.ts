/**
 * @hook useUserForm
 * @description Custom hook for managing UserForm state, validation, and mutation lifecycle.
 *
 * @architectural_decision
 * Why Custom Hook over Container / Presentational Pattern?
 * 1. Low Overhead: Avoids creating and maintaining an 8+ property interface (UserFormViewProps)
 *    and manual prop-drilling for a single-field form.
 * 2. Modern React Paradigm: Custom Hooks decouple business logic, state management, and side-effects
 *    from UI rendering without creating artificial component boundary layers.
 * 3. High Cohesion & Testability: State and mutation lifecycle can be tested independently
 *    via `renderHook()` from `@testing-library/react` and easily reused across different UI containers
 *    (e.g., modals, drawers, or inline forms).
 *
 * @validation
 * Validation rules are declared once in a Zod schema and enforced by react-hook-form.
 * Adding new fields or rules requires no new useState variables — only schema additions.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAtomValue } from "jotai";
import { createUserMutationAtom } from "../atoms/user-atoms";

// ---------------------------------------------------------------------------
// Validation schema — single source of truth for all username rules
// ---------------------------------------------------------------------------
const userFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .max(250, "Username cannot exceed 250 characters."),
});

type UserFormValues = z.infer<typeof userFormSchema>;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useUserForm() {
  const {
    register,
    handleSubmit,
    reset: rhfReset,
    formState: { errors, isValid },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    mode: "onChange",
    defaultValues: { username: "" },
  });

  // Jotai mutation atom for user creation
  const { mutate, isPending, isError, isSuccess, error, reset: mutationReset } =
    useAtomValue(createUserMutationAtom);

  // Auto-clear input field and reset form state upon successful creation
  useEffect(() => {
    if (isSuccess) {
      rhfReset();
    }
  }, [isSuccess, rhfReset]);

  const onSubmit = (data: UserFormValues) => {
    if (isPending) return;
    mutate(data.username);
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isValid,
    isPending,
    isError,
    isSuccess,
    error,
    resetMutation: mutationReset,
  };
}
