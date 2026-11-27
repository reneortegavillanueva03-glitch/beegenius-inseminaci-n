import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";

const EMPTY = {
  name: "",
  code: "",
  origin: "",
  gentleness: "3",
  productivity: "3",
  hygienic: "3",
  varroa: "3",
  honeyAvg: "",
  notes: "",
  active: true,
};

const SCORE_OPTIONS = ["1", "2", "3", "4", "5"];

export default function LineFormDialog({ open, onOpenChange, line }) {
  const [form, setForm] = useState(EMPTY);
  const [places, setPlaces] = useState([]);
  const [customOrigin, setCustomOrigin] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return undefined;
    setCustomOrigin(false);
    let alive = true;
    Promise.all([
      base44.entities.BreedingLine.list({ limit: 200 }),
      base44.entities.Hive.list({ limit: 200 }),
    ])
      .then(([lines, hives]) => {
        if (!alive) return;
        const bag = new Set();
        lines.items.forEach((item) => item.origin && bag.add(item.origin.trim()));
        hives.items.forEach((item) => item.location && bag.add(item.location.trim()));
        setPlaces([...bag].sort((a, b) => a.localeCompare(b, "es")));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(
        line
          ? {
              name: line.name ?? "",
              code: line.code ?? "",
              origin: line.origin ?? "",
              gentleness: String(line.gentleness ?? 3),
              productivity: String(line.productivity ?? 3),
              hygienic: String(line.hygienic ?? 3),
              varroa: String(line.varroa ?? 3),
              honeyAvg: line.honeyAvg != null ? String(line.honeyAvg) : "",
              notes: line.notes ?? "",
              active: line.active !== false,
            }
          : EMPTY
      );
    }
  }, [open, line]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) =>
      line ? base44.entities.BreedingLine.update(line.id, payload) : base44.entities.BreedingLine.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      toast.success(line ? "Línea actualizada" : "Línea creada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo guardar la línea"),
  });

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre de la línea es obligatorio");
      return;
    }
    mutation.mutate({
      name: form.name.trim(),
      code: form.code.trim(),
      origin: form.origin,
      gentleness: Number(form.gentleness),
      productivity: Number(form.productivity),
      hygienic: Number(form.hygienic),
      varroa: Number(form.varroa),
      honeyAvg: form.honeyAvg ? Number(form.honeyAvg) : undefined,
      notes: form.notes,
      active: form.active,
    });
  };

  const score = (key, label) => (
    <Field label={label}>
      <Select value={form[key]} onValueChange={(v) => set(key, v)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SCORE_OPTIONS.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );

  const originOptions = [...new Set([...places, line?.origin, form.origin].filter(Boolean))];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={line ? "Editar línea" : "Nueva línea de cría"}
      description="Puntúa los rasgos de 1 (bajo) a 5 (alto)."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre *">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Abeja negra seleccionada" />
        </Field>
        <Field label="Código">
          <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="APN-L-04" />
        </Field>
        <Field label="Origen – lugar" className="sm:col-span-2">
          {customOrigin ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={form.origin}
                onChange={(e) => set("origin", e.target.value)}
                placeholder="Lugar de origen de la línea"
              />
              <Button type="button" variant="outline" onClick={() => setCustomOrigin(false)}>
                Lista
              </Button>
            </div>
          ) : (
            <Select
              value={form.origin || undefined}
              onValueChange={(value) => {
                if (value === "__otro") {
                  setCustomOrigin(true);
                  set("origin", "");
                  return;
                }
                set("origin", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el origen o lugar" />
              </SelectTrigger>
              <SelectContent>
                {originOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="__otro">Otro lugar…</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Field>
        {score("gentleness", "Docilidad")}
        {score("productivity", "Producción de miel")}
        {score("hygienic", "Higiene")}
        {score("varroa", "Resistencia a varroa")}
        <Field label="Miel media (kg/colmena)">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={form.honeyAvg}
            onChange={(e) => set("honeyAvg", e.target.value)}
            placeholder="28"
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 sm:mt-6">
          <span className="text-[12.5px] font-medium text-foreground/80">Línea activa</span>
          <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
        </div>
      </div>
      <Field label="Notas">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </Field>
    </FormDialog>
  );
}