import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

/**
 * Estado de los productos de un cliente en México: los 4 de Cobre (pay-in, pay-out,
 * transferencias internacionales y pagos masivos) y los 4 de Ecart Pay (enlaces de pago, POS
 * físico, suscripciones y domiciliación). Sale del alta en Cobre (Subcliente + Balance), de la
 * conexión del comercio con Ecart Pay y de sus sucursales.
 */
export type EstadoProducto = "activo" | "pendiente" | "inactivo" | "proximamente";

export type ProductoCliente = {
  proveedor: "Cobre" | "Ecart Pay";
  nombre: string;
  descripcion: string;
  estado: EstadoProducto;
  detalle: string;
};

const ALTA_COBRE: Record<string, string> = {
  enviando: "Alta enviándose a Cobre",
  processing: "Alta en revisión por Cobre",
  approved: "Alta aprobada; falta la cuenta",
  rejected: "Cobre rechazó el alta",
  failed: "El alta falló; hay que reenviarla",
  error_envio: "El alta no se pudo enviar",
};

export async function getProductosCliente(legajo: string): Promise<ProductoCliente[]> {
  const sb = requireSupabase();
  const [alta, cuenta, matriz, comercios] = await Promise.all([
    sb
      .from("cobre_subclientes")
      .select("estado, revocado_at")
      .eq("cliente_legajo", legajo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("cobre_cuentas")
      .select("clabe, conectividad")
      .eq("cliente_legajo", legajo)
      .eq("tipo", "cliente")
      .eq("estado", "activa")
      .limit(1)
      .maybeSingle(),
    sb.from("cobre_cuentas").select("tipo").in("tipo", ["global", "usa"]).eq("estado", "activa"),
    sb.from("comercios").select("id").eq("legajo", legajo),
  ]);
  for (const r of [alta, cuenta, matriz, comercios]) {
    if (r.error) throw new DataAccessError(r.error);
  }

  const ids = (comercios.data ?? []).map((c) => c.id);
  const [conexiones, sucursales, suscripciones, domiciliaciones] = ids.length
    ? await Promise.all([
        sb
          .from("comercio_proveedores")
          .select("estado, entorno")
          .eq("proveedor", "ecartpay")
          .in("comercio_id", ids),
        sb
          .from("sucursales")
          .select("id", { count: "exact", head: true })
          .in("comercio_id", ids)
          .is("eliminado_at", null),
        sb
          .from("suscripciones")
          .select("id", { count: "exact", head: true })
          .in("comercio_id", ids)
          .in("estado", ["activa", "pausada"]),
        sb
          .from("domiciliaciones")
          .select("id", { count: "exact", head: true })
          .in("comercio_id", ids)
          .in("estado", ["created", "active", "pending"]),
      ])
    : [null, null, null, null];
  if (conexiones?.error) throw new DataAccessError(conexiones.error);
  if (sucursales?.error) throw new DataAccessError(sucursales.error);

  // Cobre: todo depende de tener la cuenta (Balance) activa y conectada.
  const conCuenta = !!cuenta.data && (cuenta.data.conectividad ?? "connected") === "connected";
  const sinCuenta: Pick<ProductoCliente, "estado" | "detalle"> = alta.data
    ? {
        estado: ["enviando", "processing", "approved"].includes(alta.data.estado)
          ? "pendiente"
          : "inactivo",
        detalle: ALTA_COBRE[alta.data.estado] ?? alta.data.estado,
      }
    : { estado: "inactivo", detalle: "Sin alta en Cobre (pestaña Cobre)" };
  const revocada = alta.data?.revocado_at ? " · Cobre la rechazó después por cumplimiento" : "";
  const cobre = (detalle: string): Pick<ProductoCliente, "estado" | "detalle"> =>
    conCuenta ? { estado: "activo", detalle: detalle + revocada } : sinCuenta;
  const dolares = (matriz.data ?? []).length >= 2;

  // Ecart Pay: la conexión del comercio (OAuth).
  const conexion =
    (conexiones?.data ?? []).find((c) => c.estado === "conectado") ?? (conexiones?.data ?? [])[0];
  const conectado = conexion?.estado === "conectado";
  const entorno = conexion?.entorno === "sandbox" ? " (sandbox)" : "";
  const sinEcart: Pick<ProductoCliente, "estado" | "detalle"> = !ids.length
    ? { estado: "inactivo", detalle: "El cliente no tiene comercio" }
    : conexion
      ? {
          estado: conexion.estado === "pendiente" ? "pendiente" : "inactivo",
          detalle: `Conexión con Ecart Pay: ${conexion.estado}`,
        }
      : { estado: "inactivo", detalle: "El comercio no conectó su cuenta de Ecart Pay" };
  const nSucursales = sucursales?.count ?? 0;

  return [
    {
      proveedor: "Cobre",
      nombre: "Pay-in",
      descripcion: "Recibir dinero: depósitos a su CLABE y cobros SPEI (R2P)",
      ...cobre(`CLABE ${cuenta.data?.clabe ?? "—"}`),
    },
    {
      proveedor: "Cobre",
      nombre: "Pay-out",
      descripcion: "Enviar transferencias SPEI",
      ...cobre("Transferencias SPEI habilitadas"),
    },
    {
      proveedor: "Cobre",
      nombre: "Transferencias internacionales",
      descripcion: "Pesos a dólares y pagos Fedwire / SWIFT",
      ...(conCuenta && !dolares
        ? { estado: "pendiente" as const, detalle: "Faltan los Balances Global y USA de JPay" }
        : cobre("Conversión y envíos en dólares habilitados")),
    },
    {
      proveedor: "Cobre",
      nombre: "Pagos masivos",
      descripcion: "Envíos SPEI en lote (archivo)",
      ...cobre("Lotes habilitados"),
    },
    {
      proveedor: "Ecart Pay",
      nombre: "Links de pago",
      descripcion: "Cobros con tarjeta, SPEI y OXXO desde un link",
      ...(conectado
        ? { estado: "activo" as const, detalle: `Cuenta conectada${entorno}` }
        : sinEcart),
    },
    {
      proveedor: "Ecart Pay",
      nombre: "POS físico",
      descripcion: "Cobros en terminal: sucursales, cajas y terminales",
      ...(conectado
        ? nSucursales
          ? {
              estado: "activo" as const,
              detalle: `${nSucursales} ${nSucursales === 1 ? "sucursal" : "sucursales"}`,
            }
          : { estado: "pendiente" as const, detalle: "Conectado, sin sucursales cargadas" }
        : sinEcart),
    },
    {
      proveedor: "Ecart Pay",
      nombre: "Suscripciones",
      descripcion: "Cobro recurrente con tarjeta",
      ...(conectado
        ? {
            estado: "activo" as const,
            detalle: `${suscripciones?.count ?? 0} suscripciones vigentes`,
          }
        : sinEcart),
    },
    {
      proveedor: "Ecart Pay",
      nombre: "Domiciliación",
      descripcion: "Cobro recurrente con cuenta bancaria (CLABE del cliente)",
      ...(conectado
        ? {
            estado: "activo" as const,
            detalle: `${domiciliaciones?.count ?? 0} domiciliaciones vigentes`,
          }
        : sinEcart),
    },
  ];
}
