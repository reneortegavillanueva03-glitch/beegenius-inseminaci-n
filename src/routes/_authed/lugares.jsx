import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import PlaceFormDialog from "@/components/lugares/PlaceFormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/lugares")({
  head: () => ({ meta: [{ title: "Lugares · Apiario" }] }),
  component: PlacesPage,
});

function PlacesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: places = [], isLoading } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const page = await base44.entities.Place.list({ sort: "name", limit: 300 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Place.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lugar eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el lugar"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (place) => {
    setEditing(place);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Lugares"
        description="Filas, sectores o estantes del apiario donde se ubican núcleos y colmenas."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo lugar
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={MapPin}
            title="Todavía no hay lugares"
            description="Registra los lugares del apiario para asignarlos a los núcleos y mantener el orden en campo."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nuevo lugar
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {places.map((place) => (
            <div key={place.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="num font-heading text-[20px] font-extrabold tracking-tight">{place.code}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] font-medium text-foreground/80">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {place.name}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(place)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setDeleting(place)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {place.notes && (
                <p className="mt-3 border-t pt-3 text-[11.5px] text-muted-foreground">{place.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar el lugar ${deleting?.code ?? ""}?`}
        description="Se eliminará el lugar del apiario. Los núcleos y apiarios registrados no cambian."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <PlaceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} place={editing} />
    </>
  );
}