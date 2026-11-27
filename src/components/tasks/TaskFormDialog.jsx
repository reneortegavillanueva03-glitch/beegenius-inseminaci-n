import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { TASK_TYPE_OPTIONS } from "@/lib/labels";

const EMPTY = { title: "", type: "revision", dueDate: "", queenCode: "", notes: "" };

export default function TaskFormDialog({ open, onOpenChange, task }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            title: task.title ?? "",
            type: task.type ?? "revision",
            dueDate: task.dueDate ?? "",
            queenCode: task.queenCode ?? "",
            notes: task.notes ?? "",
          }
        : EMPTY
    );
  }, [open, task]);

  const { data: queens = [] } = useQuery({
    queryKey: ["queens-options"],
    queryFn: async () => {
      const page = await base44.entities.Queen.filter({}, { sort: "-created_date", limit: 300 });
      return page.items;
    },
    enabled: open,
    staleTime: 0,
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      task ? base44.entities.Task.update(task.id, payload) : base44.entities.Task.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(task ? "Tarea actualizada" : "Tarea creada");
      onOpenChange(false);
    },
    onError: () => toast.error(task ? "No se pudo actualizar la tarea" : "No se pudo crear la tarea"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Escribe un título para la tarea");
      return;
    }
    mutation.mutate({ ...form, title: form.title.trim(), ...(task ? {} : { done: false }) });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Editar tarea" : "Nueva tarea"}
      description="Revisiones, inseminaciones programadas y trabajo de campo."
      onSubmit={submit}
      submitting={mutation.isPending}
      submitLabel={task ? "Guardar" : "Crear tarea"}
    >
      <Field label="Título *">
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Revisión de postura · APN-R-26-118"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </Field>
        <Field label="Reina relacionada" className="sm:col-span-2" hint="Selecciona una reina registrada en el programa.">
          <Select
            value={form.queenCode || "none"}
            onValueChange={(v) => set("queenCode", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin reina asignada</SelectItem>
              {queens.map((queen) => (
                <SelectItem key={queen.id} value={queen.code}>
                  {queen.code}
                  {queen.line ? ` · ${queen.line}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {queens.length === 0 && (
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">Aún no hay reinas registradas.</p>
          )}
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}