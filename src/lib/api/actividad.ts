import { requireSupabase } from "@/lib/supabase";
import { formatMoney } from "@/shared/format";
import { DataAccessError } from "./errors";

/** Movimiento reciente de un cliente (Administración → Usuarios → Actividad). */
export type EventoActividad = {
  id: string;
  legajo: string;
  email: string;
  fecha: string;
  hora: string;
  tipo: string;
  monto: string;
  estado: string;
  nombre: string;
  destino: string;
  cuit: string;
  destinatario: string;
  /** Cuenta de destino (CLABE / CBU / CVU) o referencia de la operación. */
  cvu: string;
  /** Cuenta del cliente desde la que salió o a la que entró el dinero. */
  cvuBalance: string;
};

const TIPO: Record<string, string> = {
  deposito: "Depósito",
  retiro: "Retiro",
  transferencia: "Transferencia",
  conversion: "Conversión a dólares",
  tarjeta: "Pago con tarjeta",
  pago_pct: "Pago PCT",
  cobro_pct: "Cobro PCT",
  acreditacion_lote: "Acreditación de lote",
  liquidacion_lote: "Liquidación de lote",
  adelanto: "Adelanto",
  ajuste_manual: "Ajuste de saldo",
};

type Fila = {
  id: string;
  legajo: string;
  tipo: string;
  cvu: string | null;
  monto_operacion: number;
  currency_code: string | null;
  fecha: string | null;
  created_at: string;
  destinatario_nombre: string | null;
  destinatario_cuit: string | null;
  destinatario_banco: string | null;
  estados_movimiento: { nombre: string | null; codigo: string } | null;
  clientes: { correo: string | null; nombre: string | null } | null;
  subaccounts: { cbu: string | null; nombre: string | null } | null;
};

/** Últimos movimientos de todos los clientes (los más nuevos primero). */
export async function listActividad(limite = 500): Promise<EventoActividad[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("transactions")
    .select(
      "id, legajo, tipo, cvu, monto_operacion, currency_code, fecha, created_at, destinatario_nombre, destinatario_cuit, destinatario_banco, estados_movimiento(nombre, codigo), clientes!transactions_cliente_id_fkey(correo, nombre), subaccounts!transactions_subcuenta_id_fkey(cbu, nombre)",
    )
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new DataAccessError(error);
  return ((data ?? []) as unknown as Fila[]).map((t) => {
    const d = new Date(t.fecha ?? t.created_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      id: t.id,
      legajo: t.legajo,
      email: t.clientes?.correo ?? "—",
      fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      tipo: TIPO[t.tipo] ?? t.tipo,
      monto: formatMoney(Number(t.monto_operacion), { moneda: t.currency_code ?? undefined }),
      estado: t.estados_movimiento?.nombre ?? t.estados_movimiento?.codigo ?? "—",
      nombre: t.clientes?.nombre ?? "—",
      destino: t.destinatario_banco ?? "—",
      cuit: t.destinatario_cuit ?? "—",
      destinatario: t.destinatario_nombre ?? "—",
      cvu: t.cvu ?? "—",
      cvuBalance: t.subaccounts?.cbu ?? t.subaccounts?.nombre ?? "—",
    };
  });
}
