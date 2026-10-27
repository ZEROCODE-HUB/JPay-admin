import { useDeveloperMode } from "@/hooks/use-developer-mode";
import { useIntegraciones } from "@/hooks/useIntegraciones";
import { useControlesTecnicos } from "../hooks/useControlesTecnicos";
import { buildIntegracionUI } from "../utils";
import { IntegracionesGrid } from "./IntegracionesGrid";
import { VistaDesarrollador } from "./VistaDesarrollador";

/** Gestor de integraciones: vista operativa o, en modo desarrollador, vista técnica. */
export function ConfiguracionPage() {
  const { devMode } = useDeveloperMode();
  const {
    rows: integraciones,
    isLoading,
    isError,
    isEmpty,
  } = useIntegraciones({
    page: 0,
    pageSize: 100,
  });

  const controles = useControlesTecnicos();

  if (!devMode) {
    return (
      <IntegracionesGrid
        integraciones={integraciones.map(buildIntegracionUI)}
        isLoading={isLoading}
        isError={isError}
        isEmpty={isEmpty}
      />
    );
  }

  return <VistaDesarrollador controles={controles} integraciones={integraciones} />;
}
