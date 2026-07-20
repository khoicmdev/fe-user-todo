import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../rootRoute";
import { TodosPage } from "@repo/todos/TodosPage";

export const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: TodosPage,
});
