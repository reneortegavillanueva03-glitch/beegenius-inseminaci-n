import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MonthlyChart({ data }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="fillInsem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.28} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillAcept" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.18} />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(20,32,40,0.08)",
            }}
            labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
          />
          <Area
            type="monotone"
            dataKey="inseminaciones"
            name="Inseminaciones"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fill="url(#fillInsem)"
          />
          <Area
            type="monotone"
            dataKey="aceptadas"
            name="Aceptadas"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fill="url(#fillAcept)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}