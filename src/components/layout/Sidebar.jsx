import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Crown, Bug, Syringe, Boxes, Container, Hexagon, ListChecks, BarChart3, Map, MapPin, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Operación",
    items: [
      { href: "/", label: "Panel", icon: LayoutDashboard },
      { href: "/reinas", label: "Reinas", icon: Crown },
      { href: "/zanganos", label: "Zánganos", icon: Bug },
      { href: "/inseminaciones", label: "Inseminaciones", icon: Syringe },
      { href: "/nucleos", label: "Núcleos", icon: Boxes },
      { href: "/colmenas", label: "Colmenas", icon: Container },
      { href: "/apiarios", label: "Apiarios", icon: MapPin },
      { href: "/lugares", label: "Lugares", icon: Map },
    ],
  },
  {
    title: "Programa de cría",
    items: [
      { href: "/lineas", label: "Líneas", icon: Hexagon },
      { href: "/tareas", label: "Tareas", icon: ListChecks },
      { href: "/informes", label: "Informes", icon: BarChart3 },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--honey))] text-[#2b2113]">
              <Hexagon className="h-5 w-5" strokeWidth={2.6} />
            </div>
            <div>
              <p className="font-heading text-[15px] font-extrabold tracking-tight text-white">Apiario</p>
              <p className="text-[11px] text-sidebar-foreground/70">Inseminación instrumental</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                        active ? "bg-white/10 text-white" : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[hsl(var(--honey))]" />
                      )}
                      <Icon className={cn("h-[17px] w-[17px]", active ? "text-[hsl(var(--honey))]" : "opacity-80")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {(user?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">{user?.full_name || "Apicultor"}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}