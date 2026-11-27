import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import InspectionFormDialog from "@/components/inspections/InspectionFormDialog";
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
import { COLONY, INSPECTION_TYPE, INSPECTION_TYPE_OPTIONS, LAYING, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/inspecciones")({
  head: () => ({ meta: [{ title: "Inspecciones · Apiario" }] }),
  component: InspectionsPage,
});

function InspectionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["inspections", type, search],
    queryFn: async () => {
      const query = {};
      if (type !== "all") query.type = type;
      if (search.trim()) query.hiveCode = { $regex: search.trim(), $options: "i" };
      const page = await base44.entities.Inspection.filter(query, { sort: "-date", limit: 200 });
      return page.items;
    },
  });

  const { data: apiaries = [] } = useQuery({
    queryKey: ["apiaries"],
    queryFn: async () => {
      const page = await base44.entities.Apiary.list({ sort: "code", limit: 300 });
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

  const { data: queens = [] } = useQuery({
    queryKey: ["queens-lookup"],
    queryFn: async () => {
      const page = await base44.entities.Queen.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Inspection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Inspección eliminada");
      setDeleteTarget(null);
    },
    onError: () => toast.error("No se pudo eliminar la inspección"),
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (inspection) => {
    setEditing(inspection);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Inspecciones"
        description="Registro de revisiones de campo: fuerza de la colonia, postura, reina y niveles de varroa."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva inspección
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por colmena"
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full bg-card sm:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {INSPECTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{inspections.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : inspections.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Todavía no hay inspecciones registradas"
            description="Registra la primera revisión de tus colmenas para seguir su evolución."
            action={
              <Button onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva inspección
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Fecha", "Tipo", "Apiario", "Colmena", "Reina", "Colonia", "Postura", "Varroa", ""].map((head) => (
                    <th
                      key={head}
                      className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="num px-5 py-3 text-[12.5px] font-semibold text-foreground">{fmtDate(item.date)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={item.type} map={INSPECTION_TYPE} />
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.apiary || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.hiveCode || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.queenCode || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={item.colony} map={COLONY} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge value={item.laying} map={LAYING} />
                    </td>
                    <td className="num px-5 py-3 text-[12.5px] text-muted-foreground">
                      {item.varroa === undefined || item.varroa === null ? "—" : item.varroa}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(item)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <InspectionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        inspection={editing}
        apiaries={apiaries}
        hives={hives}
        queens={queens}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta inspección?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro del {fmtDate(deleteTarget?.date)} de la colmena {deleteTarget?.hiveCode || "—"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate(deleteTarget.id)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}