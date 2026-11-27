import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bug, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import DroneFormDialog from "@/components/zanganos/DroneFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DRONE_STATUS, DRONE_STATUS_OPTIONS, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/zanganos")({
  head: () => ({ meta: [{ title: "Zánganos · Apiario" }] }),
  component: DronesPage,
});

function DronesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: drones = [], isLoading } = useQuery({
    queryKey: ["drones", status, search],
    queryFn: async () => {
      const query = {};
      if (status !== "all") query.status = status;
      if (search.trim()) query.code = { $regex: search.trim(), $options: "i" };
      const page = await base44.entities.Drone.filter(query, { sort: "-created_date", limit: 200 });
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

  const { data: hives = [] } = useQuery({
    queryKey: ["hives"],
    queryFn: async () => {
      const page = await base44.entities.Hive.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Drone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drones"] });
      toast.success("Zángano eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el zángano"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (drone) => {
    setEditing(drone);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Zánganos"
        description="Zánganos de las colonias de origen: línea, colmena y disponibilidad para la colecta de semen."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo zángano
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full bg-card sm:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {DRONE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{drones.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : drones.length === 0 ? (
          <EmptyState
            icon={Bug}
            title="Todavía no hay zánganos registrados"
            description="Registra los zánganos por línea y colmena de origen para saber qué colonias aportan semen en cada inseminación."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nuevo zángano
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Código", "Línea", "Colmena", "Nacimiento", "Estado", ""].map((head, index) => (
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
                {drones.map((drone) => (
                  <tr
                    key={drone.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="num px-5 py-3 text-[12.5px] font-semibold text-foreground">{drone.code}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{drone.line || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{drone.colony || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(drone.emergenceDate)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={drone.status} map={DRONE_STATUS} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(drone)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setDeleting(drone)}
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

      <AlertDialog open={!!deleting} onOpenChange={(value) => !value && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el zángano {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro del zángano. Las inseminaciones ya registradas no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DroneFormDialog open={dialogOpen} onOpenChange={setDialogOpen} drone={editing} lines={lines} hives={hives} />
    </>
  );
}