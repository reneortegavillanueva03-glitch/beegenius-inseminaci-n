export const QUEEN_STATUS = {
  virgen: { label: "Virgen", className: "bg-secondary text-foreground/70" },
  inseminada: { label: "Inseminada", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  en_postura: { label: "En postura", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  retenida: { label: "Retenida", className: "bg-[hsl(203_30%_93%)] text-[hsl(203_35%_32%)]" },
  descartada: { label: "Descartada", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
};

export const QUEEN_STATUS_OPTIONS = Object.entries(QUEEN_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const MOTHER_QUEEN_STATUS = {
  activa: { label: "Activa", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  retenida: { label: "Retenida", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  retirada: { label: "Retirada", className: "bg-secondary text-foreground/70" },
};

export const MOTHER_QUEEN_STATUS_OPTIONS = Object.entries(MOTHER_QUEEN_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const RESULT = {
  pendiente: { label: "Pendiente", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  aceptada: { label: "Aceptada", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  rechazada: { label: "Rechazada", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
};

export const RESULT_OPTIONS = Object.entries(RESULT).map(([value, item]) => ({ value, label: item.label }));

export const NUC_STATUS = {
  libre: { label: "Libre", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  ocupado: { label: "Ocupado", className: "bg-[hsl(203_30%_93%)] text-[hsl(203_35%_32%)]" },
  mantenimiento: { label: "Mantenimiento", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
};

export const NUC_STATUS_OPTIONS = Object.entries(NUC_STATUS).map(([value, item]) => ({ value, label: item.label }));

export const NUC_TYPE = {
  fecundacion: { label: "Fecundación", className: "bg-[hsl(203_30%_93%)] text-[hsl(203_35%_32%)]" },
  banco: { label: "Banco de reinas", className: "bg-[hsl(270_35%_94%)] text-[hsl(270_35%_38%)]" },
  cria: { label: "Cría", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  produccion: { label: "Producción", className: "bg-secondary text-foreground/70" },
};

export const NUC_TYPE_OPTIONS = Object.entries(NUC_TYPE).map(([value, item]) => ({ value, label: item.label }));

export const DRONE_STATUS = {
  disponible: { label: "Disponible", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  colectado: { label: "Colectado", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  descartado: { label: "Descartado", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
};

export const DRONE_STATUS_OPTIONS = Object.entries(DRONE_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const HIVE_STATUS = {
  activa: { label: "Activa", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  en_revision: { label: "En revisión", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  debil: { label: "Débil", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
  sin_reina: { label: "Sin reina", className: "bg-[hsl(270_35%_94%)] text-[hsl(270_35%_38%)]" },
  descartada: { label: "Descartada", className: "bg-secondary text-foreground/70" },
};

export const HIVE_STATUS_OPTIONS = Object.entries(HIVE_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const APIARY_STATUS = {
  activo: { label: "Activo", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  en_revision: { label: "En revisión", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  inactivo: { label: "Inactivo", className: "bg-secondary text-foreground/70" },
};

export const APIARY_STATUS_OPTIONS = Object.entries(APIARY_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const LAYING = {
  sin_postura: { label: "Sin postura", className: "bg-secondary text-foreground/70" },
  postura_inicial: { label: "Postura inicial", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  postura_consolidada: { label: "Postura consolidada", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
};

export const LAYING_OPTIONS = Object.entries(LAYING).map(([value, item]) => ({ value, label: item.label }));

export const TASK_TYPE = {
  revision: { label: "Revisión", className: "bg-[hsl(203_30%_93%)] text-[hsl(203_35%_32%)]" },
  inseminacion: { label: "Inseminación", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  traslarve: { label: "Traslarve", className: "bg-[hsl(270_35%_94%)] text-[hsl(270_35%_38%)]" },
  alimentacion: { label: "Alimentación", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  otro: { label: "Otro", className: "bg-secondary text-foreground/70" },
};

export const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPE).map(([value, item]) => ({ value, label: item.label }));

export const INSPECTION_TYPE = {
  rutina: { label: "Rutina", className: "bg-[hsl(203_30%_93%)] text-[hsl(203_35%_32%)]" },
  postura: { label: "Postura", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  sanidad: { label: "Sanidad", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
  alimentacion: { label: "Alimentación", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  otro: { label: "Otro", className: "bg-secondary text-foreground/70" },
};

export const INSPECTION_TYPE_OPTIONS = Object.entries(INSPECTION_TYPE).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const COLONY = {
  fuerte: { label: "Fuerte", className: "bg-[hsl(150_40%_93%)] text-[hsl(155_45%_26%)]" },
  media: { label: "Media", className: "bg-[hsl(var(--honey-soft))] text-[hsl(32_65%_30%)]" },
  debil: { label: "Débil", className: "bg-[hsl(4_70%_95%)] text-[hsl(4_65%_40%)]" },
};

export const COLONY_OPTIONS = Object.entries(COLONY).map(([value, item]) => ({ value, label: item.label }));

export function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function fmtShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" });
}