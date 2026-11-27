import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Activity, CheckCircle2, Crown, Syringe } from "lucide-react";

export const Route = createFileRoute("/_authed/informes")({
  head: () => ({ meta: [{ title: "Informes · Apiario" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [total, accepted, pending, inLaying, byLine, monthly] = await Promise.all([
        base44.entities.Insemination.count(),
        base44.entities.Insemination.count({ result: "aceptada" }),
        base44.entities.Insemination.count({ result: "pendiente" }),
        base44.entities.Queen.count({ status: "en_postura" }),
        base44.entities.Insemination.aggregate({ groupBy: "line" }),
        base44.entities.Insemination.aggregate({ dateBucket: { field: "date", unit: "month" } }),
      ]);
      return {
        total,
        accepted,
        pending,
        inLaying,
        byLine: (byLine.rows ?? []).filter((row) => row.line),
        monthly: (monthly.rows ?? []).map((row) => ({ ...row, label: String(row.date ?? "").slice(0, 7) })),
      };
    },
  });

  const rate = data?.total ? Math.round((data.accepted / data.total) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría"
        title="Informes"
        description="Resultados del programa: aceptación de inseminaciones, avance mensual y rendimiento por línea."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Inseminaciones" value={data?.total ?? 0} hint="Registradas en total" icon={Syringe} />
        <StatCard
          label="Tasa de aceptación"
          value={rate}
          unit="%"
          hint={`${data?.accepted ?? 0} aceptadas`}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="Pendientes de revisión" value={data?.pending ?? 0} hint="Sin resultado confirmado" icon={Activity} tone="honey" />
        <StatCard label="Reinas en postura" value={data?.inLaying ?? 0} hint="Confirmadas en el apiario" icon={Crown} tone="slate" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-heading text-[15px] font-bold tracking-tight">Inseminaciones por mes</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">Volumen de trabajo del programa</p>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly ?? []} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={44} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value) => [value, "Inseminaciones"]}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="font-heading text-[15px] font-bold tracking-tight">Inseminaciones por línea</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">Línea materna de la reina inseminada</p>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byLine ?? []} layout="vertical" margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  type="category"
                  dataKey="line"
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(value) => [value, "Inseminaciones"]}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 6, 6, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}