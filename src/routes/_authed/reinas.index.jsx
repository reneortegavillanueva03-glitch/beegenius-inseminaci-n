import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import QueenFormDialog from "@/components/queens/QueenFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUEEN_STATUS, QUEEN_STATUS_OPTIONS, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/reinas/")({
  head: () => ({ meta: [{ title: "Reinas · Apiario" }] }),
  component: QueensPage,
});

function QueensPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const { data: queens = [], isLoading } = useQuery({
    queryKey: ["queens", status, search],
    queryFn: async () => {
      const query = {};
      if (status !== "all") query.status = status;
      if (search.trim()) query.code = { $regex: search.trim(), $options: "i" };
      const page = await base44.entities.Queen.filter(query, { sort: "-created_date", limit: 200 });
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

  const { data: apiaries = [] } = useQuery({
    queryKey: ["apiaries"],
    queryFn: async () => {
      const page = await base44.entities.Apiary.list({ sort: "code", limit: 300 });
      return page.items;
    },
  });

  const { data: nucs = [] } = useQuery({
    queryKey: ["nucs"],
    queryFn: async () => {
      const page = await base44.entities.MatingNuc.list({ sort: "number", limit: 300 });
      return page.items;
    },
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Queen.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queens"] });
      toast.success("Reina eliminada");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar la reina"),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (queen) => {
    setEditing(queen);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría"
        title="Reinas"
        description="Registro de reinas del apiario: origen, línea, estado reproductivo y núcleo asignado."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva reina
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
            {QUEEN_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{queens.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : queens.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="Todavía no hay reinas registradas"
            description="Empieza registrando las reinas vírgenes que entrarán al programa de inseminación."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva reina
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Código", "Línea", "Estado", "Traslarve", "Enjaulado", "Apiario", "Núcleo", "Nacimiento", "Postura", ""].map((head, index) => (
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
                {queens.map((queen) => (
                  <tr key={queen.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <Link
                        to="/reinas/$queenId"
                        params={{ queenId: queen.id }}
                        className="num text-[12.5px] font-semibold text-foreground hover:text-primary"
                      >
                        {queen.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{queen.line || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge value={queen.status} map={QUEEN_STATUS} />
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(queen.graftDate)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(queen.cageDate)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{queen.apiary || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{queen.nucCode || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(queen.emergenceDate)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtDate(queen.layingDate)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(queen)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setDeleting(queen)}
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
        title={`¿Eliminar la reina ${deleting?.code ?? ""}?`}
        description="Se eliminará el registro de la reina. Sus inseminaciones y revisiones quedan en el historial."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <QueenFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        queen={editing}
        lines={lines}
        apiaries={apiaries}
        nucs={nucs}
      />
    </>
  );
}