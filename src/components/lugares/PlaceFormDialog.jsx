import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";

const EMPTY = { code: "", name: "", notes: "" };

export default function PlaceFormDialog({ open, onOpenChange, place }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        place
          ? { code: place.code ?? "", name: place.name ?? "", notes: place.notes ?? "" }
          : EMPTY
      );
    }
  }, [open, place]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      place ? base44.entities.Place.update(place.id, payload) : base44.entities.Place.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success(place ? "Lugar actualizado" : "Lugar registrado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar el lugar"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("El código y el nombre del lugar son obligatorios");
      return;
    }
    mutation.mutate({ ...form, code: form.code.trim(), name: form.name.trim() });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={place ? "Editar lugar" : "Nuevo lugar"}
      description="Lugares del apiario: filas, sectores o estantes donde se ubican núcleos y colmenas."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-L-01" />
        </Field>
        <Field label="Nombre *">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Fila 2" />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}