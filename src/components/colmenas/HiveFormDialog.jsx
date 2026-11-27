import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { HIVE_STATUS_OPTIONS } from "@/lib/labels";

const EMPTY = {
  code: "",
  location: "",
  line: "",
  queenCode: "",
  status: "activa",
  honeyKg: "",
  installedDate: "",
  lastRevision: "",
  notes: "",
};

export default function HiveFormDialog({ open, onOpenChange, hive, queens = [], lines = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        hive
          ? {
              code: hive.code ?? "",
              location: hive.location ?? "",
              line: hive.line ?? "",
              queenCode: hive.queenCode ?? "",
              status: hive.status ?? "activa",
              honeyKg: hive.honeyKg ?? "",
              installedDate: hive.installedDate ?? "",
              lastRevision: hive.lastRevision ?? "",
              notes: hive.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, hive]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      hive ? base44.entities.Hive.update(hive.id, payload) : base44.entities.Hive.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hives"] });
      toast.success(hive ? "Colmena actualizada" : "Colmena registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar la colmena"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim()) {
      toast.error("El código de la colmena es obligatorio");
      return;
    }
    mutation.mutate({
      ...form,
      code: form.code.trim(),
      honeyKg: form.honeyKg === "" ? null : Number(form.honeyKg),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={hive ? "Editar colmena" : "Nueva colmena"}
      description="Colmenas de producción: reina instalada, estado de la colonia y miel acumulada."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="C-07" />
        </Field>
        <Field label="Ubicación">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Fila 3" />
        </Field>
        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HIVE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Reina instalada">
          <Select value={form.queenCode || "none"} onValueChange={(v) => set("queenCode", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sin reina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin reina</SelectItem>
              {queens.map((queen) => (
                <SelectItem key={queen.id} value={queen.code}>
                  {queen.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Línea">
          <Select value={form.line || "none"} onValueChange={(v) => set("line", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sin línea" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin línea</SelectItem>
              {lines.map((line) => (
                <SelectItem key={line.id} value={line.name}>
                  {line.code ? `${line.code} · ${line.name}` : line.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Miel acumulada (kg)">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={form.honeyKg}
            onChange={(e) => set("honeyKg", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Instalación">
          <Input type="date" value={form.installedDate} onChange={(e) => set("installedDate", e.target.value)} />
        </Field>
        <Field label="Última revisión">
          <Input type="date" value={form.lastRevision} onChange={(e) => set("lastRevision", e.target.value)} />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}