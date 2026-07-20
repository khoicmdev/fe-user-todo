import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./rootRoute";
import { indexRoute } from "./children/indexRoute";
import { usersRoute } from "./children/usersRoute";
import { todosRoute } from "./children/todosRoute";

// Combine individual route definitions into a single route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  todosRoute,
]);

// Create and export router instance
export const router = createRouter({ routeTree });

// Register router for TypeScript type safety across TanStack hooks
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
