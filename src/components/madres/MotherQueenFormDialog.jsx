import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { MOTHER_QUEEN_STATUS_OPTIONS } from "@/lib/labels";

const EMPTY = {
  code: "",
  line: "",
  apiary: "",
  selectionYear: "",
  status: "activa",
  notes: "",
};

export default function MotherQueenFormDialog({ open, onOpenChange, mother }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        mother
          ? {
              code: mother.code ?? "",
              line: mother.line ?? "",
              apiary: mother.apiary ?? "",
              selectionYear: mother.selectionYear ?? "",
              status: mother.status ?? "activa",
              notes: mother.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, mother]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const { data: lines = [] } = useQuery({
    queryKey: ["lines"],
    queryFn: async () => {
      const page = await base44.entities.BreedingLine.list({ sort: "name", limit: 300 });
      return page.items;
    },
  });

  const { data: apiaries = [] } = useQuery({
    queryKey: ["apiaries"],
    queryFn: async () => {
      const page = await base44.entities.Apiary.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      mother ? base44.entities.MotherQueen.update(mother.id, payload) : base44.entities.MotherQueen.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mother-queens"] });
      toast.success(mother ? "Reina madre actualizada" : "Reina madre registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar la reina madre"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim()) {
      toast.error("El código de la reina madre es obligatorio");
      return;
    }
    mutation.mutate({
      ...form,
      code: form.code.trim(),
      selectionYear: form.selectionYear === "" ? undefined : Number(form.selectionYear),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mother ? "Editar reina madre" : "Nueva reina madre"}
      description="Reinas seleccionadas que aportan genética al programa de cría."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-RM-01" />
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
        <Field label="Año de selección">
          <Input
            type="number"
            value={form.selectionYear}
            onChange={(e) => set("selectionYear", e.target.value)}
            placeholder="2026"
          />
        </Field>
        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOTHER_QUEEN_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}