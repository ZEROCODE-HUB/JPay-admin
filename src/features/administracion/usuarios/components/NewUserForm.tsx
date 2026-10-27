import { useState } from "react";
import { BtnPrimary, Input } from "@/components/portal-shell";
import type { Rol } from "@/lib/api/types";
import { nuevoAdminUser, type NuevoAdminUser } from "../utils";

/** Formulario de alta de usuario de backoffice. */
export function NewUserForm({
  roles,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  roles: Rol[];
  submitting: boolean;
  error: string | null;
  onSubmit: (vars: NuevoAdminUser) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState(roles[0]?.id ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const vars = nuevoAdminUser({ nombre, email, legajo, password, rolId });
        if (vars) onSubmit(vars);
      }}
    >
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Nombre</label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Legajo</label>
        <Input value={legajo} onChange={(e) => setLegajo(e.target.value)} placeholder="Opcional" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Contraseña</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Rol</label>
        <select
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          value={rolId}
          onChange={(e) => setRolId(e.target.value)}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-md border border-input bg-card text-sm font-semibold hover:bg-accent"
        >
          Cancelar
        </button>
        <BtnPrimary type="submit" disabled={submitting || !rolId} className="flex-1">
          {submitting ? "Creando…" : "Crear usuario"}
        </BtnPrimary>
      </div>
    </form>
  );
}
