import { useEffect, useState } from "react";
import { Menu, ChevronDown, LogOut, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import TaskAlerts from "@/components/layout/TaskAlerts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Lima",
      })
    );
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-foreground/70 hover:bg-secondary lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 text-[12.5px] text-muted-foreground sm:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="capitalize">{today || "Programa de cría"}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-[11.5px] font-medium text-muted-foreground md:inline">
            Temporada 2026
          </span>
          <TaskAlerts />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:bg-secondary">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {(user?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-[12.5px] font-medium sm:inline">{user?.full_name || "Apicultor"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-[13px]">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}