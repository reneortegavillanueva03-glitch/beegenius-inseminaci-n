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
import { LAYING_OPTIONS } from "@/lib/labels";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FollowUpDialog({ open, onOpenChange, queen }) {
  const [form, setForm] = useState({ date: today(), day: "7", accepted: true, laying: "sin_postura", eggs: "", notes: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm({ date: today(), day: "7", accepted: true, laying: "sin_postura", eggs: "", notes: "" });
    }
  }, [open]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      await base44.entities.FollowUp.create({
        queenId: queen.id,
        queenCode: queen.code,
        date: form.date,
        day: Number(form.day),
        accepted: form.accepted,
        laying: form.laying,
        eggs: form.eggs ? Number(form.eggs) : undefined,
        notes: form.notes,
      });
      if (form.laying === "postura_consolidada") {
        await base44.entities.Queen.update(queen.id, { status: "en_postura", layingDate: form.date });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["queen", queen.id] });
      queryClient.invalidateQueries({ queryKey: ["queens"] });
      toast.success("Revisión registrada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo registrar la revisión"),
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Revisión · ${queen?.code ?? ""}`}
      description="Registra el resultado de la revisión tras la inseminación."
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      submitting={mutation.isPending}
      submitLabel="Guardar revisión"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha">
          <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
        <Field label="Día de revisión">
          <Select value={form.day} onValueChange={(v) => set("day", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["3", "7", "14", "21"].map((day) => (
                <SelectItem key={day} value={day}>
                  Día {day}
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
        <Field label="Celdas con huevos">
          <Input
            type="number"
            min="0"
            value={form.eggs}
            onChange={(e) => set("eggs", e.target.value)}
            placeholder="120"
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 sm:col-span-2">
          <span className="text-[12.5px] font-medium text-foreground/80">Reina aceptada por la colonia</span>
          <Switch checked={form.accepted} onCheckedChange={(v) => set("accepted", v)} />
        </div>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}