import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Syringe, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import InseminationFormDialog from "@/components/inseminations/InseminationFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESULT, RESULT_OPTIONS, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/inseminaciones")({
  head: () => ({ meta: [{ title: "Inseminaciones · Apiario" }] }),
  component: InseminationsPage,
});

function InseminationsPage() {
  const [result, setResult] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: inseminations = [], isLoading } = useQuery({
    queryKey: ["inseminations", result],
    queryFn: async () => {
      const query = result === "all" ? {} : { result };
      const page = await base44.entities.Insemination.filter(query, { sort: "-date", limit: 200 });
      return page.items;
    },
  });

  const { data: queens = [] } = useQuery({
    queryKey: ["queens", "all", ""],
    queryFn: async () => {
      const page = await base44.entities.Queen.filter({}, { sort: "-created_date", limit: 200 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Insemination.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inseminations"] });
      toast.success("Inseminación eliminada");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar la inseminación"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (insemination) => {
    setEditing(insemination);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Inseminaciones"
        description="Registro técnico de cada inseminación instrumental: reina, zánganos, volumen de semen y resultado."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar inseminación
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-[190px] bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los resultados</SelectItem>
            {RESULT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{inseminations.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : inseminations.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title="Sin inseminaciones registradas"
            description="Registra la primera inseminación para empezar a medir la tasa de aceptación."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Registrar inseminación
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Fecha", "Reina", "Línea", "Zánganos", "N.º", "Semen", "CO₂", "Resultado", ""].map((head, index) => (
                    <th
                      key={head || `col-${index}`}
                      className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inseminations.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-5 py-3 text-[12.5px] font-medium text-foreground">{fmtDate(item.date)}</td>
                    <td className="px-5 py-3">
                      {item.queenId ? (
                        <Link
                          to="/reinas/$queenId"
                          params={{ queenId: item.queenId }}
                          className="num text-[12.5px] font-semibold text-foreground hover:text-primary"
                        >
                          {item.queenCode}
                        </Link>
                      ) : (
                        <span className="num text-[12.5px] text-foreground/80">{item.queenCode}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.line || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.droneLine || "—"}</td>
                    <td className="num px-5 py-3 text-[12.5px] text-muted-foreground">{item.droneCount ?? "—"}</td>
                    <td className="num px-5 py-3 text-[12.5px] text-foreground/80">
                      {item.semenVolume ? `${item.semenVolume} µl` : "—"}
                    </td>
                    <td className="num px-5 py-3 text-[12.5px] text-muted-foreground">
                      {item.co2Minutes ? `${item.co2Minutes} min` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge value={item.result} map={RESULT} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setDeleting(item)}
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
        title={`¿Eliminar la inseminación de ${deleting?.queenCode ?? ""}?`}
        description="Se eliminará el registro de la inseminación. La reina y sus revisiones no cambian."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <InseminationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        queens={queens}
        insemination={editing}
      />
    </>
  );
}