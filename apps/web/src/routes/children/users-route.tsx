import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "../../app";
import { UserDetail, UsersPage, updateUserMutationAtom } from "@repo/users";
import {
  CreateTodoForm,
  TodoTable,
  TodoStatusEditProvider,
  useTodoStatusEdit,
} from "@repo/todos";
import { useAtomValue } from "jotai";

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

// Detail route wrapper component using Slot Composition + Context Bridge
function UserDetailRouteComponent() {
  const { id } = userDetailRoute.useParams();
  const userId = Number(id);

  // useTodoStatusEdit is created here (composition root) and provided via context.
  // TodoTable (mode="user") reads/writes the context.
  // This component reads it to build the save payload — keeping atoms in their packages.
  const todoStatusEdit = useTodoStatusEdit();

  const { mutate: updateUser, isPending: isSaving } =
    useAtomValue(updateUserMutationAtom);

  const handleSave = (username: string) => {
    updateUser(
      {
        userId,
        username,
        todoUpdates: todoStatusEdit.buildPayload(),
      },
      {
        onSuccess: () => todoStatusEdit.reset(),
      }
    );
  };

  return (
    // Provide the context so TodoTable (mode="user") can read/write checkbox state
    <TodoStatusEditProvider value={todoStatusEdit}>
      <UserDetail
        createTodoFormSlot={<CreateTodoForm fixedAssigneeId={userId} />}
        todoTableSlot={<TodoTable mode="user" userId={userId} />}
        hasTodoChanges={todoStatusEdit.hasChanges}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </TodoStatusEditProvider>
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
