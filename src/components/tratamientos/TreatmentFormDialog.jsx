import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { TREATMENT_STATUS_OPTIONS, TREATMENT_TYPE_OPTIONS } from "@/lib/labels";
import useAppUsers, { userLabel } from "@/lib/useAppUsers";

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  code: "",
  type: "varroa",
  product: "",
  dose: "",
  target: "",
  date: today(),
  nextDate: "",
  withdrawalDays: "",
  responsible: "",
  status: "programado",
  notes: "",
};

export default function TreatmentFormDialog({ open, onOpenChange, treatment }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  const { data: hives = [] } = useQuery({
    queryKey: ["hives"],
    queryFn: async () => {
      const page = await base44.entities.Hive.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const { data: nucs = [] } = useQuery({
    queryKey: ["nucs"],
    queryFn: async () => {
      const page = await base44.entities.MatingNuc.list({ sort: "number", limit: 300 });
      return page.items;
    },
  });

  const { data: users = [] } = useAppUsers();

  const targetOptions = [];
  const seenTargets = new Set();
  hives.forEach((hive) => {
    if (!hive.code || seenTargets.has(hive.code)) return;
    seenTargets.add(hive.code);
    targetOptions.push({ value: hive.code, label: `Colmena · ${hive.code}` });
  });
  nucs.forEach((nuc) => {
    if (!nuc.number || seenTargets.has(nuc.number)) return;
    seenTargets.add(nuc.number);
    targetOptions.push({ value: nuc.number, label: `Núcleo · ${nuc.number}` });
  });
  if (form.target && !targetOptions.some((option) => option.value === form.target)) {
    targetOptions.unshift({ value: form.target, label: form.target });
  }

  const responsibleOptions = [...new Set(users.map((user) => userLabel(user)))].map((label) => ({
    value: label,
    label,
  }));
  if (form.responsible && !responsibleOptions.some((option) => option.value === form.responsible)) {
    responsibleOptions.unshift({ value: form.responsible, label: form.responsible });
  }

  useEffect(() => {
    if (!open) return;
    setForm(
      treatment
        ? {
            code: treatment.code ?? "",
            type: treatment.type ?? "varroa",
            product: treatment.product ?? "",
            dose: treatment.dose ?? "",
            target: treatment.target ?? "",
            date: treatment.date ?? "",
            nextDate: treatment.nextDate ?? "",
            withdrawalDays: treatment.withdrawalDays ?? "",
            responsible: treatment.responsible ?? "",
            status: treatment.status ?? "programado",
            notes: treatment.notes ?? "",
          }
        : EMPTY
    );
  }, [open, treatment]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      treatment
        ? base44.entities.Treatment.update(treatment.id, payload)
        : base44.entities.Treatment.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast.success(treatment ? "Tratamiento actualizado" : "Tratamiento registrado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar el tratamiento"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim()) {
      toast.error("El código del tratamiento es obligatorio");
      return;
    }
    mutation.mutate({
      ...form,
      code: form.code.trim(),
      withdrawalDays: form.withdrawalDays ? Number(form.withdrawalDays) : undefined,
      nextDate: form.nextDate || undefined,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={treatment ? "Editar tratamiento" : "Nuevo tratamiento"}
      description="Sanidad y alimentación: producto, dosis, colonia tratada y carencia."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-T-01" />
        </Field>
        <Field label="Tipo">
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TREATMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Producto">
          <Input
            value={form.product}
            onChange={(e) => set("product", e.target.value)}
            placeholder="Ácido oxálico"
          />
        </Field>
        <Field label="Dosis">
          <Input value={form.dose} onChange={(e) => set("dose", e.target.value)} placeholder="3 ml por colmena" />
        </Field>
        <Field label="Aplicado en">
          <Select value={form.target || "none"} onValueChange={(v) => set("target", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona colmena o núcleo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {targetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
              {TREATMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fecha de aplicación">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Próxima aplicación">
          <Input type="date" value={form.nextDate} onChange={(e) => set("nextDate", e.target.value)} />
        </Field>
        <Field label="Carencia (días)">
          <Input
            type="number"
            min="0"
            value={form.withdrawalDays}
            onChange={(e) => set("withdrawalDays", e.target.value)}
            placeholder="15"
          />
        </Field>
        <Field label="Responsable">
          <Select
            value={form.responsible || "none"}
            onValueChange={(v) => set("responsible", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin responsable</SelectItem>
              {responsibleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>
    </FormDialog>
  );
}