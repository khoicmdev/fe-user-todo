import { useParams } from "@tanstack/react-router";

export function TodoDetail() {
  const params = useParams({ from: "/todos/$id" });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Todo Detail Page (@repo/todos)</h2>
      <p className="text-gray-600">Todo ID: {params.id}</p>
    </div>
  );
}
