import { createContext, useContext, type ReactNode } from "react";
import type { TodoStatusEdit } from "../hooks/use-todo-status-edit";

const TodoStatusEditContext = createContext<TodoStatusEdit | null>(null);

export interface TodoStatusEditProviderProps {
  value: TodoStatusEdit;
  children: ReactNode;
}

/**
 * Provides the TodoStatusEdit context to a subtree.
 * Should be created and provided at the composition root (apps/web),
 * consumed internally by TodoTable (mode="user").
 */
export function TodoStatusEditProvider({
  value,
  children,
}: TodoStatusEditProviderProps) {
  return (
    <TodoStatusEditContext.Provider value={value}>
      {children}
    </TodoStatusEditContext.Provider>
  );
}

/**
 * Reads the TodoStatusEdit context.
 * Used inside TodoTable (mode="user") to read/write checkbox state.
 * Throws if used outside of a TodoStatusEditProvider.
 */
export function useTodoStatusEditContext(): TodoStatusEdit {
  const ctx = useContext(TodoStatusEditContext);
  if (!ctx) {
    throw new Error(
      "useTodoStatusEditContext must be used inside a TodoStatusEditProvider"
    );
  }
  return ctx;
}
