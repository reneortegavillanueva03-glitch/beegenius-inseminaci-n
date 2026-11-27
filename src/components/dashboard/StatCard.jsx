import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  honey: "bg-[hsl(var(--honey-soft))] text-[hsl(32_60%_32%)]",
  slate: "bg-secondary text-foreground/70",
  green: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_28%)]",
};

export default function StatCard({ label, value, unit, hint, icon: Icon, tone = "primary" }) {
  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("grid h-8 w-8 place-items-center rounded-lg", TONES[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="num mt-3 font-heading text-[30px] font-extrabold leading-none tracking-tight text-foreground">
        {value}
        {unit && <span className="ml-1 text-[14px] font-semibold text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}