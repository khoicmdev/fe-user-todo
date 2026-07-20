import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { TodosPage, TodoDetail } from "@repo/todos";

// Feature parent route (/todos)
export const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: () => <Outlet />,
});

// Index route for /todos
export const todosIndexRoute = createRoute({
  getParentRoute: () => todosRoute,
  path: "/",
  component: TodosPage,
});

// Detail child route for /todos/$id
export const todoDetailRoute = createRoute({
  getParentRoute: () => todosRoute,
  path: "$id",
  component: TodoDetail,
});

// Attach feature child routes directly under todosRoute
todosRoute.addChildren([todosIndexRoute, todoDetailRoute]);
