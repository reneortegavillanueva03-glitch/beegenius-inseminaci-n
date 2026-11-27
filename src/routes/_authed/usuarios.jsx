import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import InviteUserDialog from "@/components/usuarios/InviteUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useAppUsers, { userLabel } from "@/lib/useAppUsers";

export const Route = createFileRoute("/_authed/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios · Apiario" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: users = [], isLoading } = useAppUsers();

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Personas con acceso al sistema; se usan como responsables de los apiarios."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Invitar usuario
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : (
        <div className="panel divide-y">
          {users.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-[12px] font-semibold">
                {userLabel(item).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{userLabel(item)}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{item.email}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10.5px] uppercase tracking-wide">
                {item.role === "admin" ? "Administrador" : "Usuario"}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <InviteUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}