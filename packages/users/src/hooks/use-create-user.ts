import { useState } from "react";
import type { User } from "@repo/shared";

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (username: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fieldError = errorData?.error?.fieldErrors?.username?.[0];
        const generalError = errorData?.error;
        const message =
          fieldError ||
          (typeof generalError === "string" ? generalError : null) ||
          "Failed to create user";
        throw new Error(message);
      }

      const data: User = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        const message = err?.message || "Failed to create user";
        setError(message);
        throw err;
      } else {
        console.error("An unknown error occurred", err);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading, error };
}
