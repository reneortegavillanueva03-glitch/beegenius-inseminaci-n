import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Container, Droplets, MapPin, Pencil, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import HiveFormDialog from "@/components/colmenas/HiveFormDialog";
import { Button } from "@/components/ui/button";
import { HIVE_STATUS, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/colmenas")({
  head: () => ({ meta: [{ title: "Colmenas · Apiario" }] }),
  component: HivesPage,
});

function HivesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: hives = [], isLoading } = useQuery({
    queryKey: ["hives"],
    queryFn: async () => {
      const page = await base44.entities.Hive.list({ sort: "code", limit: 300 });
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

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (hive) => {
    setEditing(hive);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Colmenas"
        description="Colmenas del apiario: reina instalada, estado de la colonia y producción de miel acumulada."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva colmena
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : hives.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Container}
            title="Todavía no hay colmenas"
            description="Registra cada colmena con su reina y su producción de miel para comparar el rendimiento entre líneas."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva colmena
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hives.map((hive) => (
            <div key={hive.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="num font-heading text-[20px] font-extrabold tracking-tight">{hive.code}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {hive.location || "Sin ubicación"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(hive)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <StatusBadge value={hive.status} map={HIVE_STATUS} />
                {hive.line && (
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground/70">
                    {hive.line}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3 text-[11.5px]">
                <span className="text-muted-foreground">Reina</span>
                <span className="num font-medium text-foreground">{hive.queenCode || "Sin asignar"}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  Miel
                </span>
                <span className="num font-medium text-foreground">
                  {hive.honeyKg == null ? "—" : `${hive.honeyKg} kg`}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Última revisión</span>
                <span className="text-foreground/80">{fmtDate(hive.lastRevision)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <HiveFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hive={editing}
        queens={queens}
        lines={lines}
      />
    </>
  );
}