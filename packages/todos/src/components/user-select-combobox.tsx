import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import { useUserSelectInfinite } from "../hooks/use-user-select-infinite";

export interface UserSelectComboboxProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function UserSelectCombobox({
  value,
  onChange,
  disabled = false,
  className,
}: UserSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const {
    users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useUserSelectInfinite();

  const selectedUser = users.find((user) => user.id === value);

  // Trigger infinite scroll fetch when user scrolls near the bottom of CommandList
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 40 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={`w-full justify-between bg-white border-input text-slate-800 ${className || ""}`}
        >
          {isLoading ? (
            <span className="text-slate-400">Loading users...</span>
          ) : selectedUser ? (
            <span>
              {selectedUser.username} <span className="text-slate-400 text-xs">(ID: {selectedUser.id})</span>
            </span>
          ) : (
            <span className="text-slate-400">Select an assignee...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList onScroll={handleScroll} className="max-h-[220px]">
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => {
                if (typeof user.id !== "number") return null;
                const isSelected = value === user.id;

                return (
                  <CommandItem
                    key={user.id}
                    value={`${user.username} ${user.id}`}
                    onSelect={() => {
                      if (typeof user.id === "number") {
                        onChange(user.id);
                        setOpen(false);
                      }
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100 text-indigo-600" : "opacity-0"
                        }`}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-slate-800">{user.username}</span>
                      <span className="text-xs text-slate-400 font-mono">#{user.id}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center p-2 text-xs text-slate-500 gap-2 border-t border-slate-100">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>Loading more users...</span>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
