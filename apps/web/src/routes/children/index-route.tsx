import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../app";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1 className="text-2xl font-bold">Welcome to Shell App</h1>,
});
