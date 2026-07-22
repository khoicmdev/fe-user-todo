import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "../../app";
import { UsersPage, UserDetail } from "@repo/users";
import { CreateTodoForm } from "@repo/todos";

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

// Detail route wrapper component using Slot Composition
function UserDetailRouteComponent() {
  const { id } = userDetailRoute.useParams();
  const userId = Number(id);

  return (
    <UserDetail
      createTodoFormSlot={
        <CreateTodoForm fixedAssigneeId={userId} />
      }
    />
  );
}

// Detail child route for /users/$id
export const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "$id",
  component: UserDetailRouteComponent,
});

// Attach feature child routes directly under usersRoute
usersRoute.addChildren([usersIndexRoute, userDetailRoute]);
