import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, ListChecks, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import { TASK_TYPE, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/tareas")({
  head: () => ({ meta: [{ title: "Tareas · Apiario" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const page = await base44.entities.Task.filter({}, { sort: "dueDate", limit: 200 });
      return page.items;
    },
  });

  const toggle = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, { done: !task.done }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: () => toast.error("No se pudo actualizar la tarea"),
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarea eliminada");
    },
    onError: () => toast.error("No se pudo eliminar la tarea"),
  });

  const pending = tasks.filter((task) => !task.done);
  const completed = tasks.filter((task) => task.done);

  const renderTask = (task) => (
    <li key={task.id} className="flex items-start gap-3 border-b border-border px-5 py-3.5 last:border-0">
      <button
        onClick={() => toggle.mutate(task)}
        className="mt-0.5 text-muted-foreground transition-colors hover:text-primary"
        aria-label={task.done ? "Marcar como pendiente" : "Marcar como completada"}
      >
        {task.done ? <CheckCircle2 className="h-[18px] w-[18px] text-primary" /> : <Circle className="h-[18px] w-[18px]" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
          <StatusBadge value={task.type} map={TASK_TYPE} />
          {task.queenCode && <span className="num">{task.queenCode}</span>}
          {task.notes && <span className="truncate">{task.notes}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[11.5px] text-muted-foreground">{fmtDate(task.dueDate)}</span>
        <button
          onClick={() => remove.mutate(task.id)}
          className="text-muted-foreground/60 transition-colors hover:text-destructive"
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría"
        title="Tareas"
        description="Revisiones, inseminaciones programadas y trabajo de campo del apiario."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva tarea
          </Button>
        }
      />

      {isLoading ? (
        <div className="panel space-y-3 p-6">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ListChecks}
            title="No hay tareas programadas"
            description="Crea revisiones a 3, 7 y 14 días después de cada inseminación para confirmar la postura."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva tarea
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between px-5 pb-1 pt-4">
              <h2 className="font-heading text-[14px] font-bold tracking-tight">Pendientes</h2>
              <span className="num text-[12px] text-muted-foreground">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <p className="px-5 py-6 text-[12.5px] text-muted-foreground">Todo al día. No quedan tareas pendientes.</p>
            ) : (
              <ul>{pending.map(renderTask)}</ul>
            )}
          </div>

          {completed.length > 0 && (
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between px-5 pb-1 pt-4">
                <h2 className="font-heading text-[14px] font-bold tracking-tight">Completadas</h2>
                <span className="num text-[12px] text-muted-foreground">{completed.length}</span>
              </div>
              <ul>{completed.map(renderTask)}</ul>
            </div>
          )}
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}