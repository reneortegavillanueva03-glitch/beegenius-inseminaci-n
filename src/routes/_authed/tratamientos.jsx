import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Pill, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import TreatmentFormDialog from "@/components/tratamientos/TreatmentFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { TREATMENT_STATUS, TREATMENT_STATUS_OPTIONS, TREATMENT_TYPE, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/tratamientos")({
  head: () => ({ meta: [{ title: "Tratamientos · Apiario" }] }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["treatments", status, search],
    queryFn: async () => {
      const query = {};
      if (status !== "all") query.status = status;
      if (search.trim()) {
        query.$or = [
          { code: { $regex: search.trim(), $options: "i" } },
          { product: { $regex: search.trim(), $options: "i" } },
        ];
      }
      const page = await base44.entities.Treatment.filter(query, { sort: "-date", limit: 200 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Treatment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast.success("Tratamiento eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el tratamiento"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (treatment) => {
    setEditing(treatment);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Tratamientos"
        description="Sanidad y alimentación del apiario: producto, dosis, colonia tratada y días de carencia."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo tratamiento
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o producto"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full bg-card sm:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {TREATMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{treatments.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : treatments.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="Todavía no hay tratamientos registrados"
            description="Registra los tratamientos de varroa, nosema o alimentación con su dosis, fecha y días de carencia."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nuevo tratamiento
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Código", "Tipo", "Producto", "Aplicado en", "Aplicación", "Próxima", "Estado", ""].map(
                    (head, index) => (
                      <th
                        key={head || `col-${index}`}
                        className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => (
                  <tr
                    key={treatment.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="num px-5 py-3 text-[12.5px] font-semibold text-foreground">{treatment.code}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={treatment.type} map={TREATMENT_TYPE} />
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">
                      {treatment.product || "—"}
                      {treatment.dose ? <span className="text-muted-foreground"> · {treatment.dose}</span> : null}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{treatment.target || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(treatment.date)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(treatment.nextDate)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={treatment.status} map={TREATMENT_STATUS} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(treatment)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setDeleting(treatment)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar el tratamiento ${deleting?.code ?? ""}?`}
        description="Se eliminará el registro del tratamiento. Las colmenas y núcleos no cambian."
        onConfirm={() => {
          remove.mutate(deleting.id);
          setDeleting(null);
        }}
      />

      <TreatmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} treatment={editing} />
    </>
  );
}