import { Link } from "@tanstack/react-router";
import StatusBadge from "@/components/common/StatusBadge";
import { RESULT, fmtShortDate } from "@/lib/labels";

export default function RecentTable({ inseminations }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="font-heading text-[15px] font-bold tracking-tight">Últimas inseminaciones</h2>
        <Link to="/inseminaciones" className="text-[12px] font-medium text-primary hover:underline">
          Ver todas
        </Link>
      </div>

      {inseminations.length === 0 ? (
        <p className="px-5 pb-6 text-[12.5px] leading-relaxed text-muted-foreground">
          Aún no hay inseminaciones registradas en esta temporada.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-y bg-secondary/50">
                {["Reina", "Línea", "Zánganos", "Fecha", "Volumen", "Resultado"].map((head) => (
                  <th
                    key={head}
                    className="px-5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inseminations.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    {row.queenId ? (
                      <Link
                        to="/reinas/$queenId"
                        params={{ queenId: row.queenId }}
                        className="num text-[12.5px] font-semibold text-foreground hover:text-primary"
                      >
                        {row.queenCode}
                      </Link>
                    ) : (
                      <span className="num text-[12.5px] font-semibold text-foreground">{row.queenCode}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[12.5px] text-foreground/80">{row.line || "—"}</td>
                  <td className="px-5 py-3 text-[12.5px] text-foreground/80">{row.droneLine || "—"}</td>
                  <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{fmtShortDate(row.date)}</td>
                  <td className="num px-5 py-3 text-[12.5px] text-foreground/80">
                    {row.semenVolume ? `${row.semenVolume} µl` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge value={row.result} map={RESULT} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}