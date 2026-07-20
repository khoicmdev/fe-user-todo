import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { UsersPage } from "@repo/users/UsersPage";

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});
