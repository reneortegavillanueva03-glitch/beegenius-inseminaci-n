import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Trash2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import QueenFormDialog from "@/components/queens/QueenFormDialog";
import FollowUpDialog from "@/components/queens/FollowUpDialog";
import { Button } from "@/components/ui/button";
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
import { LAYING, QUEEN_STATUS, RESULT, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/reinas/$queenId")({
  head: () => ({ meta: [{ title: "Ficha de reina · Apiario" }] }),
  component: QueenDetailPage,
});

function DataItem({ label, value }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[13px] text-foreground">{value || "—"}</p>
    </div>
  );
}

function QueenDetailPage() {
  const { queenId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: queen, isLoading } = useQuery({
    queryKey: ["queen", queenId],
    queryFn: () => base44.entities.Queen.get(queenId),
  });

  const { data: inseminations = [] } = useQuery({
    queryKey: ["inseminations", "queen", queen?.code],
    enabled: !!queen?.code,
    queryFn: async () => {
      const page = await base44.entities.Insemination.filter(
        { queenCode: queen.code },
        { sort: "-date", limit: 50 }
      );
      return page.items;
    },
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["followups", queenId],
    queryFn: async () => {
      const page = await base44.entities.FollowUp.filter({ queenId }, { sort: "-date", limit: 50 });
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
    mutationFn: () => base44.entities.Queen.delete(queenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queens"] });
      toast.success("Reina eliminada");
      navigate({ to: "/reinas" });
    },
    onError: () => toast.error("No se pudo eliminar la reina"),
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-secondary/60" />;
  }

  if (!queen) {
    return (
      <div className="panel">
        <EmptyState
          title="Reina no encontrada"
          description="El registro no existe o ya fue eliminado."
          action={
            <Button asChild variant="outline">
              <Link to="/reinas">Volver a reinas</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <Link to="/reinas" className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Reinas
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="num font-heading text-[26px] font-extrabold tracking-tight">{queen.code}</h1>
            <StatusBadge value={queen.status} map={QUEEN_STATUS} />
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {queen.line ? `Línea ${queen.line}` : "Sin línea asignada"}
            {queen.nucCode ? ` · Núcleo ${queen.nucCode}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar
          </Button>
          <Button onClick={() => setFollowUpOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar revisión
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="font-heading text-[15px] font-bold tracking-tight">Datos de la reina</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DataItem label="Fecha de traslarve" value={fmtDate(queen.graftDate)} />
            <DataItem label="Fecha de enjaulado" value={fmtDate(queen.cageDate)} />
            <DataItem label="Apiario" value={queen.apiary} />
            <DataItem label="Reina madre" value={queen.motherCode} />
            <DataItem label="Núcleo" value={queen.nucCode} />
            <DataItem label="Fecha de nacimiento" value={fmtDate(queen.emergenceDate)} />
            <DataItem label="Inicio de postura" value={fmtDate(queen.layingDate)} />
            <DataItem label="Estado" value={QUEEN_STATUS[queen.status]?.label} />
          </div>
          {queen.notes && (
            <div className="mt-5 rounded-xl bg-secondary/60 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Notas</p>
              <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/80">{queen.notes}</p>
            </div>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="font-heading text-[15px] font-bold tracking-tight">Revisiones</h2>
          {followUps.length === 0 ? (
            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              Sin revisiones registradas. Anota la aceptación y la postura a los 3, 7 y 14 días.
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {followUps.map((item) => (
                <li key={item.id} className="relative border-l border-border pl-4">
                  <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-foreground">Día {item.day}</p>
                    <span className="text-[11px] text-muted-foreground">{fmtDate(item.date)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge value={item.laying} map={LAYING} />
                    <span className="text-[11px] text-muted-foreground">
                      {item.accepted ? "Aceptada" : "No aceptada"}
                      {item.eggs ? ` · ${item.eggs} huevos` : ""}
                    </span>
                  </div>
                  {item.notes && <p className="mt-1 text-[11.5px] text-muted-foreground">{item.notes}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="font-heading text-[15px] font-bold tracking-tight">Inseminaciones</h2>
          <span className="num text-[12px] text-muted-foreground">{inseminations.length}</span>
        </div>
        {inseminations.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="Sin inseminaciones"
            description="Registra la inseminación desde la sección Inseminaciones para vincularla a esta reina."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-y bg-secondary/50">
                  {["Fecha", "Línea", "Zánganos", "Volumen", "CO₂", "Resultado"].map((head) => (
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
                {inseminations.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-[12.5px] font-medium text-foreground">{fmtDate(item.date)}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.line || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.droneLine || "—"}</td>
                    <td className="num px-5 py-3 text-[12.5px] text-foreground/80">
                      {item.semenVolume ? `${item.semenVolume} µl` : "—"}
                    </td>
                    <td className="num px-5 py-3 text-[12.5px] text-muted-foreground">
                      {item.co2Minutes ? `${item.co2Minutes} min` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge value={item.result} map={RESULT} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QueenFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        queen={queen}
        lines={lines}
        apiaries={apiaries}
        nucs={nucs}
      />
      <FollowUpDialog open={followUpOpen} onOpenChange={setFollowUpOpen} queen={queen} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la reina {queen.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro de la reina. Las inseminaciones y revisiones quedarán en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}