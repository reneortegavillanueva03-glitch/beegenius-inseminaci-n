import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { DRONE_STATUS_OPTIONS } from "@/lib/labels";

const EMPTY = {
  code: "",
  line: "",
  colony: "",
  emergenceDate: "",
  status: "disponible",
  notes: "",
};

export default function DroneFormDialog({ open, onOpenChange, drone, lines = [], hives = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        drone
          ? {
              code: drone.code ?? "",
              line: drone.line ?? "",
              colony: drone.colony ?? "",
              emergenceDate: drone.emergenceDate ?? "",
              status: drone.status ?? "disponible",
              notes: drone.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, drone]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      drone ? base44.entities.Drone.update(drone.id, payload) : base44.entities.Drone.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drones"] });
      toast.success(drone ? "Zángano actualizado" : "Zángano registrado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar el zángano"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim()) {
      toast.error("El código del zángano es obligatorio");
      return;
    }
    mutation.mutate({ ...form, code: form.code.trim() });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={drone ? "Editar zángano" : "Nuevo zángano"}
      description="Zánganos de línea paterna: colmena de origen, nacimiento y estado de colecta."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="Z-26-014" />
        </Field>
        <Field label="Línea">
          <Select value={form.line || "none"} onValueChange={(v) => set("line", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin línea</SelectItem>
              {lines.map((line) => (
                <SelectItem key={line.id} value={line.code || line.name}>
                  {line.code ? `${line.code} · ${line.name}` : line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Colmena de origen">
          <Select value={form.colony || "none"} onValueChange={(v) => set("colony", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sin colmena" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin colmena</SelectItem>
              {hives.map((hive) => (
                <SelectItem key={hive.id} value={hive.code}>
                  {hive.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DRONE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nacimiento">
          <Input type="date" value={form.emergenceDate} onChange={(e) => set("emergenceDate", e.target.value)} />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>
    </FormDialog>
  );
}