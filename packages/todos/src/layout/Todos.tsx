import { CreateTodoForm } from "../components/create-todo-form";
import { TodoTable } from "../components/todo-table";

export function TodosPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Global Task Board</h1>
        <p className="text-xs text-slate-500 mt-1">
          Unified view of all system-wide synchronization tasks and assignments.
        </p>
      </div>

      {/* Grid: Left Task Registry Table + Right Create ToDo Form */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left Column: Todo Table (virtual scroll, 10/page) */}
        <TodoTable mode="global" />

        {/* Right Column: Create ToDo Form (Selectable Assignee Mode) */}
        <div className="w-full">
          <CreateTodoForm />
        </div>
      </div>
    </div>
  );
}
