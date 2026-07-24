import { atom } from "jotai";

/**
 * Primitive Jotai atom storing the currently selected user ID across the application.
 * Defaults to `null` (no user selected).
 */
export const selectedUserIdAtom = atom<number | null>(null);

/**
 * Derived read-only atom to check whether a user is currently selected.
 */
export const isUserSelectedAtom = atom<boolean>(
  (get) => get(selectedUserIdAtom) !== null
);
