import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { QUEEN_STATUS_OPTIONS } from "@/lib/labels";

const EMPTY = {
  code: "",
  line: "",
  apiary: "",
  status: "virgen",
  emergenceDate: "",
  motherCode: "",
  nucCode: "",
  inseminationDate: "",
  notes: "",
};

export default function QueenFormDialog({ open, onOpenChange, queen, lines = [], apiaries = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        queen
          ? {
              code: queen.code ?? "",
              line: queen.line ?? "",
              apiary: queen.apiary ?? "",
              status: queen.status ?? "virgen",
              emergenceDate: queen.emergenceDate ?? "",
              motherCode: queen.motherCode ?? "",
              nucCode: queen.nucCode ?? "",
              inseminationDate: queen.inseminationDate ?? "",
              notes: queen.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, queen]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      queen ? base44.entities.Queen.update(queen.id, payload) : base44.entities.Queen.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queens"] });
      toast.success(queen ? "Reina actualizada" : "Reina registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar la reina"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim()) {
      toast.error("El código de la reina es obligatorio");
      return;
    }
    mutation.mutate({ ...form, code: form.code.trim() });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={queen ? "Editar reina" : "Nueva reina"}
      description="Identificación y estado dentro del programa de cría."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-R-26-118" />
        </Field>
        <Field label="Línea">
          <Select value={form.line || undefined} onValueChange={(v) => set("line", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona línea" />
            </SelectTrigger>
            <SelectContent>
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
        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUEEN_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fecha de nacimiento">
          <Input type="date" value={form.emergenceDate} onChange={(e) => set("emergenceDate", e.target.value)} />
        </Field>
        <Field label="Reina madre">
          <Input value={form.motherCode} onChange={(e) => set("motherCode", e.target.value)} placeholder="APN-R-25-042" />
        </Field>
        <Field label="Núcleo">
          <Input value={form.nucCode} onChange={(e) => set("nucCode", e.target.value)} placeholder="APN-N-12" />
        </Field>
        <Field label="Fecha de inseminación" className="sm:col-span-2">
          <Input
            type="date"
            value={form.inseminationDate}
            onChange={(e) => set("inseminationDate", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </Field>
    </FormDialog>
  );
}