import { useNavigate as useTanStackNavigate } from "@tanstack/react-router";

export type AppRouteOptions =
  | { to: "/"; params?: never }
  | { to: "/todos"; params?: never }
  | { to: "/todos/$id"; params: { id: string } }
  | { to: "/users"; params?: never }
  | { to: "/users/$id"; params: { id: string } };

/**
 * Strongly typed navigation hook for workspace packages and apps.
 * Provides strict autocomplete and type checking for all application routes.
 */
export function useAppNavigate() {
  const navigate = useTanStackNavigate();
  type TanStackNavigateOptions = Parameters<typeof navigate>[0];

  return (opts: AppRouteOptions) => {
    return navigate(opts as unknown as TanStackNavigateOptions);
  };
}
