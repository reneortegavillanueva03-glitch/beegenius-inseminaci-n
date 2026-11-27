import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import NucFormDialog from "@/components/nucleos/NucFormDialog";
import { Button } from "@/components/ui/button";
import { NUC_STATUS, NUC_TYPE, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/nucleos")({
  head: () => ({ meta: [{ title: "Núcleos · Apiario" }] }),
  component: NucsPage,
});

function NucsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: nucs = [], isLoading } = useQuery({
    queryKey: ["nucs"],
    queryFn: async () => {
      const page = await base44.entities.MatingNuc.list({ sort: "number", limit: 200 });
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

  const { data: lines = [] } = useQuery({
    queryKey: ["lines"],
    queryFn: async () => {
      const page = await base44.entities.BreedingLine.list({ sort: "name", limit: 100 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.MatingNuc.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nucs"] });
      toast.success("Núcleo eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el núcleo"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (nuc) => {
    setEditing(nuc);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Núcleos"
        description="Núcleos de fecundación y bancos de reinas: ocupación, lugar y reina asignada."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo núcleo
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : nucs.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Boxes}
            title="Todavía no hay núcleos"
            description="Registra los núcleos de fecundación para saber cuáles están libres antes de cada inseminación."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nuevo núcleo
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {nucs.map((nuc) => (
            <div key={nuc.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="num font-heading text-[20px] font-extrabold tracking-tight">{nuc.number}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {nuc.location || "Sin lugar"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(nuc)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setDeleting(nuc)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={nuc.status} map={NUC_STATUS} />
                <StatusBadge value={nuc.type} map={NUC_TYPE} />
                {nuc.line && (
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground/70">
                    {nuc.line}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-[11.5px]">
                <span className="text-muted-foreground">Reina</span>
                <span className="num font-medium text-foreground">{nuc.queenCode || "Sin asignar"}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Instalación</span>
                <span className="text-foreground/80">{fmtDate(nuc.installedDate)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Miel</span>
                <span className="num font-medium text-foreground">
                  {nuc.honeyKg == null ? "—" : `${nuc.honeyKg} kg`}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Última revisión</span>
                <span className="text-foreground/80">{fmtDate(nuc.lastRevision)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar el núcleo ${deleting?.number ?? ""}?`}
        description="Se eliminará el núcleo. Las reinas e inseminaciones registradas no cambian."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <NucFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nuc={editing}
        queens={queens}
        lines={lines}
      />
    </>
  );
}