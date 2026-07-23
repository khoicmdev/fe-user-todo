import { useState, useCallback } from "react";

export interface TodoStatusUpdate {
  id: number;
  isCompleted: boolean;
}

export interface TodoStatusEdit {
  /** Map of todoId → pending isCompleted value (only changed items) */
  pendingChanges: Record<number, boolean>;
  /**
   * Toggle a todo's completion status locally.
   * @param id - the todo id
   * @param serverIsCompleted - the current server value (to diff against)
   */
  toggleTodo: (id: number, serverIsCompleted: boolean) => void;
  /** True if there are any pending changes not yet saved */
  hasChanges: boolean;
  /** Returns only the items that differ from server state — the payload for PATCH */
  buildPayload: () => TodoStatusUpdate[];
  /** Reset all pending changes (call after successful save) */
  reset: () => void;
}

export function useTodoStatusEdit(): TodoStatusEdit {
  // pendingChanges stores ONLY items the user has toggled.
  // The value is the NEW desired isCompleted state.
  const [pendingChanges, setPendingChanges] = useState<Record<number, boolean>>({});

  const toggleTodo = useCallback((id: number, serverIsCompleted: boolean) => {
    setPendingChanges((prev) => {
      // If this id is already in pending, toggling again reverts it to server state — remove it
      if (id in prev) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      // Otherwise mark as flipped from server value
      return { ...prev, [id]: !serverIsCompleted };
    });
  }, []);

  const hasChanges = Object.keys(pendingChanges).length > 0;

  const buildPayload = useCallback((): TodoStatusUpdate[] => {
    return Object.entries(pendingChanges).map(([id, isCompleted]) => ({
      id: Number(id),
      isCompleted,
    }));
  }, [pendingChanges]);

  const reset = useCallback(() => {
    setPendingChanges({});
  }, []);

  return {
    pendingChanges,
    toggleTodo,
    hasChanges,
    buildPayload,
    reset,
  };
}
