import { requireSupabase } from "@/lib/supabase";
import { DataAccessError } from "./errors";

export type ComercioConEcartPay = {
  id: string;
  nombre: string;
  legajo: string;
  entorno: string;
};

/** Comercios con su cuenta de Ecart Pay conectada (los únicos que pueden tener POS). */
export async function listComerciosConEcartPay(): Promise<ComercioConEcartPay[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("comercio_proveedores")
    .select("comercio_id, entorno, comercios(nombre_comercio, legajo)")
    .eq("proveedor", "ecartpay")
    .eq("estado", "conectado");
  if (error) throw new DataAccessError(error);
  type Fila = {
    comercio_id: string;
    entorno: string;
    comercios: { nombre_comercio: string | null; legajo: string } | null;
  };
  return ((data ?? []) as unknown as Fila[])
    .map((r) => ({
      id: r.comercio_id,
      nombre: r.comercios?.nombre_comercio || r.comercios?.legajo || r.comercio_id,
      legajo: r.comercios?.legajo ?? "—",
      entorno: r.entorno,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}
