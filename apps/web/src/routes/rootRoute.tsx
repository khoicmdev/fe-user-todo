import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Shell Navigation */}
      <nav className="flex gap-4 border-b pb-4 mb-6 text-lg font-semibold">
        <Link to="/" className="[&.active]:font-bold [&.active]:text-blue-600">
          Home
        </Link>
        <Link to="/users" className="[&.active]:font-bold [&.active]:text-blue-600">
          Users
        </Link>
        <Link to="/todos" className="[&.active]:font-bold [&.active]:text-blue-600">
          Todos
        </Link>
      </nav>

      {/* Render child routes */}
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
