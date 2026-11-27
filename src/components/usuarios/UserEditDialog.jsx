import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";

export default function UserEditDialog({ open, onOpenChange, user }) {
  const [form, setForm] = useState({ full_name: "", role: "user" });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && user) setForm({ full_name: user.full_name ?? "", role: user.role ?? "user" });
  }, [open, user]);

  const mutation = useMutation({
    mutationFn: (payload) => base44.entities.User.update(user.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      toast.success("Usuario actualizado");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo actualizar el usuario"),
  });

  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({ full_name: form.full_name.trim(), role: form.role });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar usuario"
      description="Nombre y rol dentro del sistema."
      onSubmit={submit}
      submitting={mutation.isPending}
    >
      <Field label="Nombre">
        <Input value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
      </Field>
      <Field label="Rol">
        <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </FormDialog>
  );
}