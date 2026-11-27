export default function StatusBadge({ value, map }) {
  const item = map?.[value] ?? { label: value || "—", className: "bg-secondary text-foreground/70" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}