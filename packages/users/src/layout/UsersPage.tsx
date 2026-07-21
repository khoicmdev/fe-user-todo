import React from "react";
import { UserForm } from "../components/user-form";
import { UserTable } from "../components/user-table";

export function UsersPage() {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">Users Directory</h1>
      <p className="text-muted-foreground mb-4">Manage global developer access and monitor assigned workload.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* User form */}
        <UserForm />
        {/* User table */}
        <UserTable />
      </div>

    </div>
  );
}
