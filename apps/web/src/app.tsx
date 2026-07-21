import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-neutral text-secondary font-sans p-6">
      {/* Shell Navigation */}
      <nav className="flex gap-4 border-b border-secondary/20 pb-4 mb-6 text-lg font-semibold">
        <Link to="/" className="text-secondary/70 hover:text-primary [&.active]:font-bold [&.active]:text-primary">
          Home
        </Link>
        <Link to="/users" className="text-secondary/70 hover:text-primary [&.active]:font-bold [&.active]:text-primary">
          Users
        </Link>
        <Link to="/todos" className="text-secondary/70 hover:text-primary [&.active]:font-bold [&.active]:text-primary">
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
