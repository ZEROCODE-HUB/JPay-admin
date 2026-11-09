import { useIntegraciones } from "@/hooks/useIntegraciones";
import { buildIntegracionUI } from "../utils";
import { IntegracionesGrid } from "./IntegracionesGrid";

/** Gestor de integraciones: estado operativo de cada integración. */
export function ConfiguracionPage() {
  const {
    rows: integraciones,
    isLoading,
    isError,
    isEmpty,
  } = useIntegraciones({
    page: 0,
    pageSize: 100,
  });

  return (
    <IntegracionesGrid
      integraciones={integraciones.map(buildIntegracionUI)}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    />
  );
}
