import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import ApiaryFormDialog from "@/components/apiarios/ApiaryFormDialog";
import { Button } from "@/components/ui/button";
import { APIARY_STATUS } from "@/lib/labels";

export const Route = createFileRoute("/_authed/apiarios")({
  head: () => ({ meta: [{ title: "Apiarios · Apiario" }] }),
  component: ApiariesPage,
});

function ApiariesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: apiaries = [], isLoading } = useQuery({
    queryKey: ["apiaries"],
    queryFn: async () => {
      const page = await base44.entities.Apiary.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Apiary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiaries"] });
      toast.success("Apiario eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el apiario"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (apiary) => {
    setEditing(apiary);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Apiarios"
        description="Asentamientos del apiario: código, ubicación, responsable y estado de cada uno."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo apiario
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : apiaries.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={MapPin}
            title="Todavía no hay apiarios"
            description="Registra cada apiario con su código y ubicación para mantener ordenados los núcleos, colmenas y reinas."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nuevo apiario
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {apiaries.map((apiary) => (
            <div key={apiary.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="num font-heading text-[20px] font-extrabold tracking-tight">{apiary.code}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-foreground/80">{apiary.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(apiary)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setDeleting(apiary)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={apiary.status} map={APIARY_STATUS} />
              </div>

              <div className="mt-4 space-y-1.5 border-t pt-3 text-[11.5px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Ubicación
                  </span>
                  <span className="text-foreground/80">{apiary.location || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    Responsable
                  </span>
                  <span className="text-foreground/80">{apiary.owner || "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar el apiario ${deleting?.code ?? ""}?`}
        description="Se eliminará el apiario. Los núcleos, colmenas y reinas registrados no cambian."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <ApiaryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} apiary={editing} />
    </>
  );
}