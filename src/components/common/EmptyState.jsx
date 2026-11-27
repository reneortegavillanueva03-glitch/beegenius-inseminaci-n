export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="font-heading text-[15px] font-bold tracking-tight">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}