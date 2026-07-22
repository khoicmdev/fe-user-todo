/**
 * @hook useUserForm
 * @description Custom hook for managing UserForm state, client-side validation,
 * Jotai mutation atom subscriptions, and input field reset side effects.
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
 */

import { useAtomValue } from "jotai";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createUserMutationAtom } from "../atoms/user-atoms";

export function useUserForm() {
  // Local state for username input field
  const [username, setUsername] = useState("");

  // Jotai mutation atom for user creation
  const { mutate, isPending, isError, isSuccess, error, reset } =
    useAtomValue(createUserMutationAtom);

  // Client-side validation logic
  const trimmedUsername = username.trim();
  const isOverLimit = username.length > 250;
  const isValid = trimmedUsername.length > 0 && !isOverLimit;

  // Handle text input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Dismiss previous success/error message banner when user resumes typing
    if (isError || isSuccess) reset();
  };

  // Handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isPending) return;
    mutate(trimmedUsername);
  };

  // Auto-clear input field upon successful creation
  useEffect(() => {
    if (isSuccess) {
      setUsername("");
    }
  }, [isSuccess]);

  return {
    username,
    isPending,
    isError,
    isSuccess,
    error,
    isOverLimit,
    isValid,
    handleInputChange,
    handleSubmit,
  };
}
