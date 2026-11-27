import { Link } from "@tanstack/react-router";
import { TASK_TYPE, fmtShortDate } from "@/lib/labels";

export default function UpcomingList({ tasks }) {
  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[15px] font-bold tracking-tight">Próximas revisiones</h2>
        <Link to="/tareas" className="text-[12px] font-medium text-primary hover:underline">
          Ver tareas
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
          No hay tareas pendientes. Programa las revisiones de postura a 3, 7 y 14 días.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--honey))]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{task.title}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  {TASK_TYPE[task.type]?.label || "Tarea"}
                  {task.queenCode ? ` · ${task.queenCode}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[11.5px] font-medium text-muted-foreground">
                {fmtShortDate(task.dueDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}