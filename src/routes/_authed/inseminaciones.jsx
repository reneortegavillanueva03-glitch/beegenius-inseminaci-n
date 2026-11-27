import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Syringe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import InseminationFormDialog from "@/components/inseminations/InseminationFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESULT, RESULT_OPTIONS, fmtDate } from "@/lib/labels";

export const Route = createFileRoute("/_authed/inseminaciones")({
  head: () => ({ meta: [{ title: "Inseminaciones · Apiario" }] }),
  component: InseminationsPage,
});

function InseminationsPage() {
  const [result, setResult] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: inseminations = [], isLoading } = useQuery({
    queryKey: ["inseminations", result],
    queryFn: async () => {
      const query = result === "all" ? {} : { result };
      const page = await base44.entities.Insemination.filter(query, { sort: "-date", limit: 200 });
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

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Inseminaciones"
        description="Registro técnico de cada inseminación instrumental: reina, zánganos, volumen de semen y resultado."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Registrar inseminación
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-[190px] bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los resultados</SelectItem>
            {RESULT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="num text-[12px] text-muted-foreground sm:ml-auto">{inseminations.length} registros</span>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : inseminations.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title="Sin inseminaciones registradas"
            description="Registra la primera inseminación para empezar a medir la tasa de aceptación."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Registrar inseminación
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b bg-secondary/50">
                  {["Fecha", "Reina", "Línea", "Zánganos", "N.º", "Semen", "CO₂", "Resultado"].map((head) => (
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
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-5 py-3 text-[12.5px] font-medium text-foreground">{fmtDate(item.date)}</td>
                    <td className="px-5 py-3">
                      {item.queenId ? (
                        <Link
                          to="/reinas/$queenId"
                          params={{ queenId: item.queenId }}
                          className="num text-[12.5px] font-semibold text-foreground hover:text-primary"
                        >
                          {item.queenCode}
                        </Link>
                      ) : (
                        <span className="num text-[12.5px] text-foreground/80">{item.queenCode}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.line || "—"}</td>
                    <td className="px-5 py-3 text-[12.5px] text-foreground/80">{item.droneLine || "—"}</td>
                    <td className="num px-5 py-3 text-[12.5px] text-muted-foreground">{item.droneCount ?? "—"}</td>
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

      <InseminationFormDialog open={dialogOpen} onOpenChange={setDialogOpen} queens={queens} />
    </>
  );
}