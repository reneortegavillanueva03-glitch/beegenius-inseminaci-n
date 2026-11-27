import { Link } from "@tanstack/react-router";
import { Pencil, Crown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRAITS = [
  { key: "gentleness", label: "Docilidad" },
  { key: "productivity", label: "Producción" },
  { key: "hygienic", label: "Higiene" },
  { key: "varroa", label: "Varroa" },
];

export default function LineCard({ line, onEdit, onDelete }) {
  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {line.code && (
              <span className="num rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                {line.code}
              </span>
            )}
            <span
              className={`h-1.5 w-1.5 rounded-full ${line.active === false ? "bg-muted-foreground/40" : "bg-[hsl(150_45%_45%)]"}`}
            />
          </div>
          <h3 className="mt-2 truncate font-heading text-[15px] font-bold tracking-tight">{line.name}</h3>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{line.origin || "Sin origen registrado"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(line)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onDelete(line)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {TRAITS.map((trait) => {
          const value = Number(line[trait.key] ?? 0);
          return (
            <div key={trait.key}>
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{trait.label}</span>
                <span className="num font-medium text-foreground/70">{value || "—"}/5</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(value / 5) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Crown className="h-3.5 w-3.5" />
          {line.honeyAvg ? `${line.honeyAvg} kg/colmena` : "Sin media de miel"}
        </span>
        <Link
          to="/reinas"
          className="text-[11.5px] font-medium text-primary hover:underline"
        >
          Ver reinas
        </Link>
      </div>
    </div>
  );
}