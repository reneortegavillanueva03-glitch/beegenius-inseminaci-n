import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/common/Field";
import FormDialog from "@/components/common/FormDialog";

const EMPTY = { email: "", role: "user" };

export default function InviteUserDialog({ open, onOpenChange }) {
  const [form, setForm] = useState(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: (payload) => base44.users.inviteUser(payload.email, payload.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      toast.success("Invitación enviada");
      onOpenChange(false);
    },
    onError: () => toast.error("No se pudo enviar la invitación"),
  });

  const submit = (event) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Ingresa un correo válido");
      return;
    }
    mutation.mutate({ email, role: form.role });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo usuario"
      description="Escribe su correo y rol: recibirá una invitación para crear su cuenta y acceder al sistema."
      onSubmit={submit}
      submitting={mutation.isPending}
      submitLabel="Enviar invitación"
    >
      <Field label="Correo electrónico *">
        <Input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="apicultor@correo.com"
        />
      </Field>
      <Field label="Rol">
        <Select value={form.role} onValueChange={(v) => set("role", v)}>
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