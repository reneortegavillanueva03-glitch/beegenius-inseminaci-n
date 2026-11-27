import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const userLabel = (user) => user?.full_name || user?.email || "Sin nombre";

// Lista de usuarios de la app. Si el usuario actual no puede listar a todos,
// se usa su propia cuenta para que los selectores sigan funcionando.
export default function useAppUsers() {
  return useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      try {
        const users = await base44.entities.User.list();
        return Array.isArray(users) ? users : users?.items ?? [];
      } catch {
        const me = await base44.auth.me().catch(() => null);
        return me ? [me] : [];
      }
    },
    staleTime: 60 * 1000,
  });
}