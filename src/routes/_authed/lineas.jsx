import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Hexagon, Plus } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import LineCard from "@/components/lines/LineCard";
import LineFormDialog from "@/components/lines/LineFormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/lineas")({
  head: () => ({ meta: [{ title: "Líneas de cría · Apiario" }] }),
  component: LinesPage,
});

function LinesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: lines = [], isLoading } = useQuery({
    queryKey: ["lines"],
    queryFn: async () => {
      const page = await base44.entities.BreedingLine.list({ sort: "name", limit: 100 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.BreedingLine.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      toast.success("Línea eliminada");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar la línea"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (line) => {
    setEditing(line);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría"
        title="Líneas de cría"
        description="Rasgos de selección de cada línea: producción de miel, docilidad, higiene y resistencia a varroa."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva línea
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Hexagon}
            title="Aún no defines líneas de cría"
            description="Crea tu primera línea para clasificar las reinas y comparar resultados entre selecciones."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva línea
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lines.map((line) => (
            <LineCard key={line.id} line={line} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar la línea ${deleting?.name ?? ""}?`}
        description="Se eliminará la línea de cría. Las reinas que la usan mantienen su registro."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <LineFormDialog open={dialogOpen} onOpenChange={setDialogOpen} line={editing} />
    </>
  );
}