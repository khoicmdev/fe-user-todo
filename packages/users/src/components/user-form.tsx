import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { useAtomValue } from "jotai";
import { UserPlus } from "lucide-react";
import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import { createUserMutationAtom } from "../atoms/user-atoms";

export function UserForm() {
  // Username stays as local state — it's form-only, no other component needs it
  const [username, setUsername] = useState("");

  // atomWithMutation returns a read-only atom.
  // The atom value IS the mutation result object, which includes `mutate` and `reset`.
  // We use useAtomValue (not useAtom) since there is no writable setter.
  const { mutate, isPending, isError, isSuccess, error, reset } =
    useAtomValue(createUserMutationAtom);

  // Client-side validation — cheap & synchronous, no need for an atom
  const trimmedUsername = username.trim();
  const isOverLimit = username.length > 250;
  const isValid = trimmedUsername.length > 0 && !isOverLimit;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Dismiss any previous success/error banner as soon as the user types again
    if (isError || isSuccess) reset();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isPending) return;
    mutate(trimmedUsername);
  };

  // Clear the input field after a successful mutation
  useEffect(() => {
    if (isSuccess) {
      setUsername("");
    }
  }, [isSuccess]);

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              disabled={isPending}
            />
            {isOverLimit && (
              <p className="text-xs text-destructive">
                Username cannot exceed 250 characters. (Current: {username.length})
              </p>
            )}
          </div>

          {/* Feedback Messages — driven by TanStack Query mutation status */}
          {isError && error instanceof Error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium">
              {error.message}
            </div>
          )}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              User created successfully!
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