import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { APIARY_STATUS_OPTIONS } from "@/lib/labels";

const EMPTY = {
  code: "",
  name: "",
  location: "",
  owner: "",
  status: "activo",
  notes: "",
};

export default function ApiaryFormDialog({ open, onOpenChange, apiary }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        apiary
          ? {
              code: apiary.code ?? "",
              name: apiary.name ?? "",
              location: apiary.location ?? "",
              owner: apiary.owner ?? "",
              status: apiary.status ?? "activo",
              notes: apiary.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, apiary]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const page = await base44.entities.Place.list({ sort: "name", limit: 300 });
      return page.items;
    },
  });

  const placeOptions = useMemo(() => {
    const options = places.map((place) => ({
      value: place.name,
      label: place.code ? `${place.code} · ${place.name}` : place.name,
    }));
    if (form.location && !options.some((option) => option.value === form.location)) {
      options.unshift({ value: form.location, label: form.location });
    }
    return options;
  }, [places, form.location]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      apiary ? base44.entities.Apiary.update(apiary.id, payload) : base44.entities.Apiary.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiaries"] });
      toast.success(apiary ? "Apiario actualizado" : "Apiario registrado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar el apiario"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("El código y el nombre del apiario son obligatorios");
      return;
    }
    mutation.mutate({
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={apiary ? "Editar apiario" : "Nuevo apiario"}
      description="Asentamientos del apiario: código, ubicación, responsable y estado."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-01" />
        </Field>
        <Field label="Nombre *">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Apiario Valle Sagrado" />
        </Field>
        <Field label="Ubicación">
          <Select value={form.location || "none"} onValueChange={(v) => set("location", v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un lugar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin lugar</SelectItem>
              {placeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Responsable">
          <Input value={form.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Nombre del apicultor" />
        </Field>
        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APIARY_STATUS_OPTIONS.map((option) => (
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