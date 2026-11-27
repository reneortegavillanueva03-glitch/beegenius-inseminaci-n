import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import InviteUserDialog from "@/components/usuarios/InviteUserDialog";
import UserEditDialog from "@/components/usuarios/UserEditDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useAppUsers, { userLabel } from "@/lib/useAppUsers";

export const Route = createFileRoute("/_authed/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios · Apiario" }] }),
  component: UsersPage,
});

function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { data: users = [], isLoading } = useAppUsers();
  const { user: me } = useAuth();
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      toast.success("Usuario eliminado");
      setDeleting(null);
    },
    onError: () => toast.error("No se pudo eliminar el usuario"),
  });

  const openEdit = (user) => {
    setEditing(user);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Personas con acceso al sistema; se usan como responsables de los apiarios."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
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
      ) : users.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Users}
            title="Todavía no hay usuarios"
            description="Invita a las personas que trabajarán en el apiario para asignarlas como responsables."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Invitar usuario
              </Button>
            }
          />
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
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {item.id !== me?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(value) => !value && setDeleting(null)}
        title={`¿Eliminar a ${deleting ? userLabel(deleting) : ""}?`}
        description="La persona perderá el acceso al sistema. Sus registros de apiario se mantienen."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />

      <InviteUserDialog open={dialogOpen && !editing} onOpenChange={setDialogOpen} />
      <UserEditDialog open={dialogOpen && !!editing} onOpenChange={setDialogOpen} user={editing} />
    </>
  );
}