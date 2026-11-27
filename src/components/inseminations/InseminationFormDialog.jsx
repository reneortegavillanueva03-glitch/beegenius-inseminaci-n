import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { RESULT_OPTIONS } from "@/lib/labels";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY = {
  queenId: "",
  date: today(),
  droneLine: "",
  droneOrigin: "",
  droneCount: "",
  semenVolume: "",
  co2Minutes: "",
  technician: "",
  result: "pendiente",
  notes: "",
};

export default function InseminationFormDialog({ open, onOpenChange, queens = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async (payload) => {
      await base44.entities.Insemination.create(payload);
      if (payload.queenId) {
        await base44.entities.Queen.update(payload.queenId, {
          status: payload.result === "aceptada" ? "en_postura" : "inseminada",
          inseminationDate: payload.date,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inseminations"] });
      queryClient.invalidateQueries({ queryKey: ["queens"] });
      toast.success("Inseminación registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo registrar la inseminación"),
  });

  const submit = (event) => {
    event.preventDefault();
    const queen = queens.find((item) => item.id === form.queenId);
    if (!queen) {
      toast.error("Selecciona la reina inseminada");
      return;
    }
    mutation.mutate({
      date: form.date,
      queenId: queen.id,
      queenCode: queen.code,
      line: queen.line ?? "",
      droneLine: form.droneLine,
      droneOrigin: form.droneOrigin,
      droneCount: form.droneCount ? Number(form.droneCount) : undefined,
      semenVolume: form.semenVolume ? Number(form.semenVolume) : undefined,
      co2Minutes: form.co2Minutes ? Number(form.co2Minutes) : undefined,
      technician: form.technician,
      result: form.result,
      notes: form.notes,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar inseminación"
      description="La reina pasa automáticamente a estado inseminada o en postura."
      onSubmit={submit}
      submitting={mutation.isPending}
      submitLabel="Registrar"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Reina *" className="sm:col-span-2">
          <Select value={form.queenId || undefined} onValueChange={(v) => set("queenId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reina" />
            </SelectTrigger>
            <SelectContent>
              {queens.map((queen) => (
                <SelectItem key={queen.id} value={queen.id}>
                  {queen.code}
                  {queen.line ? ` · ${queen.line}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Línea de zánganos">
          <Input value={form.droneLine} onChange={(e) => set("droneLine", e.target.value)} placeholder="APN-L-07" />
        </Field>
        <Field label="Origen de zánganos">
          <Input
            value={form.droneOrigin}
            onChange={(e) => set("droneOrigin", e.target.value)}
            placeholder="APN-C-14"
          />
        </Field>
        <Field label="N.º de zánganos">
          <Input
            type="number"
            min="0"
            value={form.droneCount}
            onChange={(e) => set("droneCount", e.target.value)}
            placeholder="12"
          />
        </Field>
        <Field label="Semen (µl)">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={form.semenVolume}
            onChange={(e) => set("semenVolume", e.target.value)}
            placeholder="2.0"
          />
        </Field>
        <Field label="CO₂ (min)">
          <Input
            type="number"
            step="0.5"
            min="0"
            value={form.co2Minutes}
            onChange={(e) => set("co2Minutes", e.target.value)}
            placeholder="4"
          />
        </Field>
        <Field label="Técnico">
          <Input value={form.technician} onChange={(e) => set("technician", e.target.value)} />
        </Field>
        <Field label="Resultado">
          <Select value={form.result} onValueChange={(v) => set("result", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESULT_OPTIONS.map((option) => (
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