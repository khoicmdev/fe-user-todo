import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "../../app";
import { UsersPage, UserDetail } from "@repo/users";

// Feature parent route (/users)
export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: () => <Outlet />,
});

// Index route for /users
export const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "/",
  component: UsersPage,
});

// Detail child route for /users/$id
export const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id",
  component: UserDetail,
});

// Attach feature child routes directly under usersRoute
usersRoute.addChildren([usersIndexRoute, userDetailRoute]);
