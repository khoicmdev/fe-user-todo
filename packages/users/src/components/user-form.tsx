import React, { useState, useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { useCreateUser } from "../hooks/use-create-user";

interface FormState {
  error: string | null;
  success: boolean;
  message?: string;
}

const initialState: FormState = {
  error: null,
  success: false,
};

export function UserForm() {
  const [username, setUsername] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const { createUser } = useCreateUser();

  const submitAction = async (
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const name = (formData.get("username") as string || "").trim();

    if (!name) {
      return { error: "Username is required", success: false };
    }
    if (name.length > 250) {
      return { error: "Username must not exceed 250 characters", success: false };
    }

    try {
      await createUser(name);
      setUsername("");
      return {
        error: null,
        success: true,
        message: `User "${name}" created successfully!`,
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          error: err?.message || "Failed to create user",
          success: false,
        };
      } else {
        console.error("An unknown error occurred", err);
        throw err;
      }
    }
  };

  const [state, formAction, isPending] = useActionState(submitAction, initialState);

  // Validation: required, non-empty, and max 250 chars
  const trimmedLength = username.trim().length;
  const isValid = trimmedLength > 0 && username.length <= 250;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsDismissed(true);
  };

  const handleFormAction = (formData: FormData) => {
    setIsDismissed(false);
    formAction(formData);
  };

  return (
    <Card className="w-full border-border/80 shadow-sm overflow-hidden py-0 gap-0">
      {/* Card Header */}
      <CardHeader className="bg-slate-50/80 border-b border-border/60 px-5 py-4 flex flex-row items-center gap-3 space-y-0">
        <UserPlus className="w-5 h-5 text-indigo-600 shrink-0" />
        <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">
          User Creation
        </CardTitle>
      </CardHeader>

      {/* Card Content / Form */}
      <CardContent className="p-5">
        <form action={handleFormAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-xs font-medium text-slate-700">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleInputChange}
              placeholder="e.g. j_smith_dev"
            />
            {username.length > 250 && (
              <p className="text-xs text-destructive mt-1">
                Username cannot exceed 250 characters. (Current: {username.length})
              </p>
            )}
          </div>

          {/* Feedback Messages */}
          {!isDismissed && state.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium">
              {state.error}
            </div>
          )}
          {!isDismissed && state.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              {state.message}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}