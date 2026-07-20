import { useParams } from "@tanstack/react-router";

export function UserDetail() {
  const params = useParams({ from: "/users/$id" });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">User Detail Page</h2>
      <p>User ID: {params.id}</p>
    </div>
  );
}
