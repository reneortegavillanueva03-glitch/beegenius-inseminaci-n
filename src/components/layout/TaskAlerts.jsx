import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarClock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fmtDate } from "@/lib/labels";

const limaToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });

const shift = (iso, days) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export default function TaskAlerts() {
  const navigate = useNavigate();
  const today = limaToday();
  const weekAhead = shift(today, 7);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", "alerts"],
    queryFn: async () => {
      const page = await base44.entities.Task.filter({ done: false }, { sort: "dueDate", limit: 100 });
      return page.items;
    },
  });

  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today);
  const dueToday = tasks.filter((task) => task.dueDate === today);
  const soon = tasks.filter((task) => task.dueDate && task.dueDate > today && task.dueDate <= weekAhead);
  const total = overdue.length + dueToday.length;

  const goToTasks = () => navigate({ to: "/tareas" });

  const row = (task, tone) => (
    <li key={task.id}>
      <button
        onClick={goToTasks}
        className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-secondary"
      >
        <span
          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
            tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-primary" : "bg-muted-foreground/50"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-foreground">{task.title}</span>
          <span className="block text-[11px] text-muted-foreground">
            {task.queenCode ? `${task.queenCode} · ` : ""}
            {fmtDate(task.dueDate)}
          </span>
        </span>
      </button>
    </li>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Alertas de tareas"
      >
        <Bell className="h-4 w-4" />
        {total > 0 && (
          <span className="num absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {total}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <p className="font-heading text-[12.5px] font-bold tracking-tight">Alertas de tareas</p>
          <p className="text-[11px] text-muted-foreground">
            {total === 0 ? "Sin tareas vencidas ni para hoy" : `${total} tarea${total === 1 ? "" : "s"} requiere${total === 1 ? "" : "n"} atención`}
          </p>
        </div>

        {overdue.length > 0 && (
          <>
            <p className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-destructive">
              <AlertTriangle className="h-3 w-3" /> Vencidas
            </p>
            <ul>{overdue.map((task) => row(task, "danger"))}</ul>
          </>
        )}

        {dueToday.length > 0 && (
          <>
            <p className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground">
              <CalendarClock className="h-3 w-3" /> Para hoy
            </p>
            <ul>{dueToday.map((task) => row(task, "warning"))}</ul>
          </>
        )}

        {soon.length > 0 && (
          <>
            <p className="px-3 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Próximos 7 días
            </p>
            <ul className="pb-1.5">{soon.map((task) => row(task, "muted"))}</ul>
          </>
        )}

        {tasks.length === 0 && (
          <p className="px-3 py-4 text-[12px] text-muted-foreground">No hay tareas pendientes.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}