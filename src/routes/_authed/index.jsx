import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Syringe, Activity, ListChecks, Plus, ArrowRight, Hexagon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import StatusPanel from "@/components/dashboard/StatusPanel";
import UpcomingList from "@/components/dashboard/UpcomingList";
import RecentTable from "@/components/dashboard/RecentTable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Panel · Apiario" }] }),
  component: DashboardPage,
});

const STEPS = [
  {
    title: "Define tus líneas de cría",
    description: "Puntúa producción de miel, docilidad, higiene y resistencia a varroa.",
    to: "/lineas",
    label: "Ir a líneas",
    icon: Hexagon,
  },
  {
    title: "Registra las reinas",
    description: "Cada reina con su código, madre y núcleo asignado.",
    to: "/reinas",
    label: "Registrar reinas",
    icon: Crown,
  },
  {
    title: "Documenta la inseminación",
    description: "Zánganos, volumen de semen, CO₂ y resultado de la revisión.",
    to: "/inseminaciones",
    label: "Registrar inseminación",
    icon: Syringe,
  },
];

function monthLabel(key) {
  const date = new Date(`${key}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString("es-PE", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [
        queensTotal,
        inLaying,
        inseminated,
        virgin,
        monthCount,
        totalIns,
        accepted,
        pendingTasks,
        monthly,
        acceptedMonthly,
        tasksPage,
        recentPage,
      ] = await Promise.all([
        base44.entities.Queen.count(),
        base44.entities.Queen.count({ status: "en_postura" }),
        base44.entities.Queen.count({ status: "inseminada" }),
        base44.entities.Queen.count({ status: "virgen" }),
        base44.entities.Insemination.count({ date: { $gte: monthStart } }),
        base44.entities.Insemination.count(),
        base44.entities.Insemination.count({ result: "aceptada" }),
        base44.entities.Task.count({ done: false }),
        base44.entities.Insemination.aggregate({ dateBucket: { field: "date", unit: "month" } }),
        base44.entities.Insemination.aggregate({
          query: { result: "aceptada" },
          dateBucket: { field: "date", unit: "month" },
        }),
        base44.entities.Task.filter({ done: false }, { sort: "dueDate", limit: 4 }),
        base44.entities.Insemination.filter({}, { sort: "-date", limit: 5 }),
      ]);

      const acceptedMap = new Map((acceptedMonthly.rows ?? []).map((row) => [row.date, row.count]));
      const chart = (monthly.rows ?? []).map((row) => ({
        mes: monthLabel(row.date),
        inseminaciones: row.count,
        aceptadas: acceptedMap.get(row.date) ?? 0,
      }));

      return {
        queensTotal,
        inLaying,
        inseminated,
        virgin,
        monthCount,
        totalIns,
        accepted,
        pendingTasks,
        chart,
        tasks: tasksPage.items,
        recent: recentPage.items,
      };
    },
  });

  const rate = data?.totalIns ? Math.round((data.accepted / data.totalIns) * 100) : 0;
  const isNew = !isLoading && (data?.queensTotal ?? 0) === 0;

  return (
    <>
      <PageHeader
        eyebrow="Programa de cría · Temporada 2026"
        title="Panel"
        description="Seguimiento del programa de inseminación instrumental: reinas, líneas de cría y resultados de postura."
        actions={
          <Button asChild>
            <Link to="/inseminaciones">
              <Plus className="mr-1.5 h-4 w-4" />
              Registrar inseminación
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : isNew ? (
        <div className="panel overflow-hidden">
          <div className="border-b bg-secondary/40 px-6 py-8 sm:px-8">
            <h2 className="font-heading text-[20px] font-extrabold tracking-tight">Empieza tu programa de cría</h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
              Tres pasos para dejar listo el sistema: define las líneas, registra tus reinas y documenta la primera
              inseminación instrumental.
            </p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="bg-card p-6">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="num text-[11px] font-semibold text-muted-foreground">Paso {index + 1}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-[14px] font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{step.description}</p>
                  <Link
                    to={step.to}
                    className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                  >
                    {step.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Reinas registradas"
              value={data.queensTotal}
              hint={`${data.inLaying} en postura · ${data.virgin} vírgenes`}
              icon={Crown}
            />
            <StatCard
              label="Inseminaciones del mes"
              value={data.monthCount}
              hint={`${data.totalIns} en total`}
              icon={Syringe}
              tone="honey"
            />
            <StatCard
              label="Tasa de aceptación"
              value={rate}
              unit="%"
              hint={`${data.accepted} aceptadas`}
              icon={Activity}
              tone="green"
            />
            <StatCard
              label="Tareas pendientes"
              value={data.pendingTasks}
              hint="Revisiones y trabajo de campo"
              icon={ListChecks}
              tone="slate"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="panel p-5 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-[15px] font-bold tracking-tight">Inseminaciones por mes</h2>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Total realizado frente a resultados aceptados
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" /> Inseminaciones
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" /> Aceptadas
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <MonthlyChart data={data.chart} />
              </div>
            </div>

            <StatusPanel
              counts={{ inLaying: data.inLaying, inseminated: data.inseminated, virgin: data.virgin }}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <UpcomingList tasks={data.tasks} />
            <div className="lg:col-span-2">
              <RecentTable inseminations={data.recent} />
            </div>
          </div>
        </>
      )}
    </>
  );
}