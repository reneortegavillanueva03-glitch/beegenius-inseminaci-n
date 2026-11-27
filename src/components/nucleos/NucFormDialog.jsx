import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";
import { NUC_STATUS_OPTIONS, NUC_TYPE_OPTIONS } from "@/lib/labels";
import { assignmentMessage, queenAssignment } from "@/lib/queenAssignment";

const EMPTY = {
  number: "",
  location: "",
  type: "fecundacion",
  status: "libre",
  queenCode: "",
  line: "",
  honeyKg: "",
  installedDate: "",
  lastRevision: "",
  notes: "",
};

export default function NucFormDialog({ open, onOpenChange, nuc, queens = [], lines = [] }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        nuc
          ? {
              number: nuc.number ?? "",
              location: nuc.location ?? "",
              type: nuc.type ?? "fecundacion",
              status: nuc.status ?? "libre",
              queenCode: nuc.queenCode ?? "",
              line: nuc.line ?? "",
              honeyKg: nuc.honeyKg ?? "",
              installedDate: nuc.installedDate ?? "",
              lastRevision: nuc.lastRevision ?? "",
              notes: nuc.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, nuc]);

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
      nuc ? base44.entities.MatingNuc.update(nuc.id, payload) : base44.entities.MatingNuc.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nucs"] });
      toast.success(nuc ? "Núcleo actualizado" : "Núcleo registrado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar el núcleo"),
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.number.trim()) {
      toast.error("El número del núcleo es obligatorio");
      return;
    }
    const assignment = await queenAssignment(form.queenCode, { nucId: nuc?.id, nucCode: nuc?.number });
    if (assignment) {
      toast.error(assignmentMessage(assignment));
      return;
    }
    mutation.mutate({
      ...form,
      number: form.number.trim(),
      honeyKg: form.honeyKg === "" ? null : Number(form.honeyKg),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={nuc ? "Editar núcleo" : "Nuevo núcleo"}
      description="Núcleos de fecundación, bancos de reinas y colonias de cría."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Número *">
          <Input value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="APN-N-12" />
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
        <Field label="Tipo">
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NUC_TYPE_OPTIONS.map((option) => (
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
              {NUC_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Reina asignada">
          <Select
            value={form.queenCode || "none"}
            onValueChange={(v) => set("queenCode", v === "none" ? "" : v)}
          >
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