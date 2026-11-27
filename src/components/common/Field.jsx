export default function Field({ label, children, hint, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-foreground/80">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}