export default function StatusPanel({ counts }) {
  const rows = [
    { label: "En postura", value: counts.inLaying, tone: "bg-primary" },
    { label: "Inseminadas en espera", value: counts.inseminated, tone: "bg-[hsl(var(--chart-1))]" },
    { label: "Vírgenes", value: counts.virgin, tone: "bg-[hsl(var(--chart-3))]" },
  ];
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-heading text-[15px] font-bold tracking-tight">Estado del programa</h2>
        <span className="num text-[12px] text-muted-foreground">{total} reinas</span>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
              <span className="text-foreground/80">{item.label}</span>
              <span className="num font-semibold text-foreground">{item.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${item.tone}`}
                style={{ width: `${total ? Math.round((item.value / total) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-secondary/70 p-3.5">
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          Las reinas inseminadas pasan a <span className="font-semibold text-foreground">en postura</span> cuando la
          revisión confirma puesta consolidada.
        </p>
      </div>
    </div>
  );
}