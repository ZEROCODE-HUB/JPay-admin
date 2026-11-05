import { getPais } from "@/shared/pais";

/** Nombre de la cuenta bancaria de los clientes según el país de la instalación ("CLABE"). */
export function cuentaDelPais(): string {
  return getPais().cuentaBancaria.tipo;
}
