import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { INSPECTION_TYPE_OPTIONS, COLONY_OPTIONS, LAYING_OPTIONS } from "@/lib/labels";

const EMPTY = {
  date: "",
  apiary: "",
  hiveCode: "",
  queenCode: "",
  type: "rutina",
  colony: "media",
  queenSeen: false,
  laying: "sin_postura",
  varroa: "",
  notes: "",
};

export default function InspectionFormDialog({ open, onOpenChange, inspection, apiaries = [], hives = [], queens = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setForm(
      inspection
        ? {
            date: inspection.date ?? "",
            apiary: inspection.apiary ?? "",
            hiveCode: inspection.hiveCode ?? "",
            queenCode: inspection.queenCode ?? "",
            type: inspection.type ?? "rutina",
            colony: inspection.colony ?? "media",
            queenSeen: Boolean(inspection.queenSeen),
            laying: inspection.laying ?? "sin_postura",
            varroa: inspection.varroa ?? "",
            notes: inspection.notes ?? "",
          }
        : EMPTY
    );
  }, [open, inspection]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      inspection
        ? base44.entities.Inspection.update(inspection.id, payload)
        : base44.entities.Inspection.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success(inspection ? "Inspección actualizada" : "Inspección registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar la inspección"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.date) {
      toast.error("La fecha de inspección es obligatoria");
      return;
    }
    mutation.mutate({
      ...form,
      varroa: form.varroa === "" ? undefined : Number(form.varroa),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={inspection ? "Editar inspección" : "Nueva inspección"}
      description="Registro técnico del estado de la colonia en campo."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha *">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Tipo">
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INSPECTION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Apiario">
          <Select value={form.apiary || "none"} onValueChange={(v) => set("apiary", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona apiario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin apiario</SelectItem>
              {apiaries.map((apiary) => (
                <SelectItem key={apiary.id} value={apiary.code || apiary.name}>
                  {apiary.code ? `${apiary.code} · ${apiary.name}` : apiary.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Colmena / núcleo">
          <Select value={form.hiveCode || "none"} onValueChange={(v) => set("hiveCode", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona colmena" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin colmena</SelectItem>
              {hives.map((hive) => (
                <SelectItem key={hive.id} value={hive.code}>
                  {hive.location ? `${hive.code} · ${hive.location}` : hive.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Reina observada">
          <Select value={form.queenCode || "none"} onValueChange={(v) => set("queenCode", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona reina" />
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
        <Field label="Fuerza de la colonia">
          <Select value={form.colony} onValueChange={(v) => set("colony", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLONY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Postura">
          <Select value={form.laying} onValueChange={(v) => set("laying", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Varroa (ácaros / 100 abejas)">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={form.varroa}
            onChange={(e) => set("varroa", e.target.value)}
            placeholder="2.5"
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2 sm:col-span-2">
          <span className="text-[12px] font-medium text-foreground/80">Reina vista en la inspección</span>
          <Switch checked={form.queenSeen} onCheckedChange={(v) => set("queenSeen", v)} />
        </div>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>
    </FormDialog>
  );
}