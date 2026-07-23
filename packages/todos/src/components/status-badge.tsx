export function StatusBadge({ isCompleted }: { isCompleted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isCompleted
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-700 border-slate-200"
        }`}
    >
      {isCompleted ? "Complete" : "Pending"}
    </span>
  );
}
