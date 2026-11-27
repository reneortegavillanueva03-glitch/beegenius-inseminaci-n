import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Pencil, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import MotherQueenFormDialog from "@/components/madres/MotherQueenFormDialog";
import { Button } from "@/components/ui/button";
import { MOTHER_QUEEN_STATUS } from "@/lib/labels";

export const Route = createFileRoute("/_authed/reinas-madres")({
  head: () => ({ meta: [{ title: "Reinas madres · Apiario" }] }),
  component: MotherQueensPage,
});

function MotherQueensPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: mothers = [], isLoading } = useQuery({
    queryKey: ["mother-queens"],
    queryFn: async () => {
      const page = await base44.entities.MotherQueen.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (mother) => {
    setEditing(mother);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría"
        title="Reinas madres"
        description="Reinas seleccionadas que aportan genética; se asignan como reina madre en el registro de reinas."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva reina madre
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : mothers.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Crown}
            title="Todavía no hay reinas madres"
            description="Registra las reinas madres de tu programa para asignarlas luego a las reinas hijas."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva reina madre
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mothers.map((mother) => (
            <div key={mother.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="num font-heading text-[20px] font-extrabold tracking-tight">{mother.code}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-foreground/80">{mother.line || "Sin línea"}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(mother)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={mother.status} map={MOTHER_QUEEN_STATUS} />
                {mother.selectionYear && (
                  <span className="num rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-foreground/70">
                    {mother.selectionYear}
                  </span>
                )}
              </div>

              <p className="mt-4 border-t pt-3 text-[11.5px] text-muted-foreground">
                {mother.apiary || "Sin apiario"}
              </p>
            </div>
          ))}
        </div>
      )}

      <MotherQueenFormDialog open={dialogOpen} onOpenChange={setDialogOpen} mother={editing} />
    </>
  );
}