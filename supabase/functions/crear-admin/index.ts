// Edge Function: alta de usuario admin con rol.
// 1) Resuelve el rol_id desde la tabla `roles` por nombre (o usa rolId directo).
// 2) Crea el usuario en Supabase Auth (admin.createUser).
// 3) Inserta la fila en admin_users con ese mismo id y rol_id.
// Operación coordinada: si falla el insert en admin_users se elimina el usuario
// de Auth para no dejar huérfanos.
// Permisos: quien llama necesita `usuarios_backoffice: crear`; solo un admin total puede crear
// otro usuario con rol admin, y los demás solo asignan roles con permisos que ya tienen
// (`rol_asignable`), para que no haya escalada de privilegios.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { esAdmin, exigirPermiso, handler, json, userClient } from "../_shared/http.ts";

Deno.serve(
  handler(async (req) => {
    await exigirPermiso(req, "usuarios_backoffice", "crear");

    const url = Deno.env.get("SUPABASE_URL");
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !service) {
      return json({ error: "Falta configuración del servidor" }, 500);
    }

    let body: {
      email?: string;
      password?: string;
      nombre?: string;
      legajo?: string;
      rol?: string;
      rolId?: string;
    };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Body inválido" }, 400);
    }

    if (!body.email || !body.password || !body.nombre) {
      return json({ error: "Faltan email, password o nombre" }, 400);
    }

    const sb = createClient(url, service, { auth: { autoRefreshToken: false } });

    // 1) Resolver rol_id.
    let rolId = body.rolId ?? null;
    if (!rolId && body.rol) {
      const { data: rolRow, error: rolErr } = await sb
        .from("roles")
        .select("id")
        .eq("nombre", body.rol)
        .maybeSingle();
      if (rolErr) {
        return json({ error: "Error al resolver el rol" }, 400);
      }
      if (!rolRow) {
        return json({ error: `Rol "${body.rol}" no encontrado` }, 400);
      }
      rolId = rolRow.id;
    }
    if (!rolId) {
      return json({ error: "Debe indicar rol o rolId" }, 400);
    }
    const { data: rol, error: rolNombreErr } = await sb
      .from("roles")
      .select("nombre")
      .eq("id", rolId)
      .maybeSingle();
    if (rolNombreErr || !rol) {
      return json({ error: "Rol no encontrado" }, 400);
    }
    if (rol.nombre.toLowerCase() === "admin" && !(await esAdmin(req))) {
      return json({ error: "Solo un administrador puede crear usuarios con rol admin" }, 403);
    }
    // Sin escalada: quien no es admin solo asigna roles cuyos permisos ya tiene (RPC con su sesión).
    const { data: asignable, error: errAsignable } = await userClient(req).rpc("rol_asignable", {
      p_rol_id: rolId,
    });
    if (errAsignable || asignable !== true) {
      return json({ error: "No podés asignar un rol con más permisos que el tuyo" }, 403);
    }

    // 2) Crear usuario en Auth.
    const { data, error } = await sb.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { nombre: body.nombre, legajo: body.legajo ?? null, admin_via_edge: true },
    });

    if (error || !data.user) {
      return json({ error: error?.message ?? "No se pudo crear el usuario" }, 400);
    }

    // 3) Insertar fila en admin_users con el mismo id y el rol_id resuelto.
    const { error: insErr } = await sb.from("admin_users").insert({
      id: data.user.id,
      legajo: (body.legajo ?? body.email.split("@")[0]).toUpperCase(),
      email: body.email,
      nombre: body.nombre,
      activo: true,
      rol_id: rolId,
    });

    if (insErr) {
      // Rollback coordinado: eliminar el usuario de Auth para no dejar huérfano.
      await sb.auth.admin.deleteUser(data.user.id);
      return json({ error: insErr.message ?? "No se pudo crear el admin_users" }, 400);
    }

    return json({ id: data.user.id, email: data.user.email });
  }),
);
