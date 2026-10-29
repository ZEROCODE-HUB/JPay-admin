import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { Cliente } from "@/lib/api/types";
import type { ClienteDetalleData } from "../hooks/useClienteDetalle";
import type { ClienteDetalleUi } from "../hooks/useClienteDetalleUi";
import { useClienteAcciones } from "../hooks/useClienteAcciones";
import { TABS, type TabKey } from "../utils";
import { ClienteAcciones } from "./ClienteAcciones";
import { ClienteModales } from "./ClienteModales";
import { CobreTab } from "./CobreTab";
import { ContextoTab } from "./ContextoTab";
import { DocumentosTab } from "./DocumentosTab";
import { HistorialTab } from "./HistorialTab";
import { IdentificacionTab } from "./IdentificacionTab";
import { ImpuestosTab } from "./ImpuestosTab";
import { ModulosTab } from "./ModulosTab";
import { MovimientosTab } from "./MovimientosTab";
import { RequisitosActivacion } from "./RequisitosActivacion";
import { RiesgoTab } from "./RiesgoTab";
import { SubcuentasTab } from "./SubcuentasTab";
import { ValidacionesTab } from "./ValidacionesTab";

/** Ficha de cliente ya cargada: encabezado, pestañas y modales. */
export function ClienteDetalle({
  legajo,
  cliente,
  data,
  ui,
}: {
  legajo: string;
  cliente: Cliente;
  data: ClienteDetalleData;
  ui: ClienteDetalleUi;
}) {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, setConfirmAction, setExencionOpen, forzando } = ui;
  const { cambiarEstadoHomologado, forzarNuevaValidacion } = useClienteAcciones(
    legajo,
    ui,
    data.validacionesQuery,
  );

  const backToList = () =>
    navigate({
      to:
        cliente.tipoPersona === "juridica"
          ? "/admin/general/usuarios/juridicas"
          : "/admin/general/usuarios",
    });

  const tabLabel = (t: { key: TabKey; label: string }) => {
    if (t.key === "identificacion") {
      return cliente.tipoPersona === "juridica" ? "Datos de persona jurídica" : "Datos personales";
    }
    return t.label;
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={backToList}
        className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-ink hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring/20"
      >
        <ChevronLeft size={16} />
        Volver a la lista
      </button>

      <div className="min-w-0 mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground truncate">
            {cliente.nombre}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {cliente.legajo} · {cliente.correo}
          </p>
        </div>
        <ClienteAcciones
          cliente={cliente}
          setConfirmAction={setConfirmAction}
          cambiarEstadoHomologado={cambiarEstadoHomologado}
        />
      </div>

      {/* Requisitos de activación (homologado) */}
      <RequisitosActivacion cliente={cliente} data={data} />

      {/* --- Tabs --- */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.filter((t) => t.key !== "cobre" || cliente.pais === "MX").map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-primary text-primary-ink"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {activeTab === "identificacion" && (
          <IdentificacionTab cliente={cliente} data={data} ui={ui} />
        )}
        {activeTab === "movimientos" && <MovimientosTab data={data} ui={ui} />}
        {activeTab === "impuestos" && <ImpuestosTab data={data} ui={ui} />}
        {activeTab === "subcuentas" && (
          <SubcuentasTab legajo={cliente.legajo} onEximirCuit={() => setExencionOpen(true)} />
        )}

        {activeTab === "documentos" && <DocumentosTab legajo={cliente.legajo} />}
        {activeTab === "validaciones" && (
          <ValidacionesTab
            data={data}
            forzando={forzando}
            forzarNuevaValidacion={forzarNuevaValidacion}
          />
        )}
        {activeTab === "contexto" && <ContextoTab data={data} ui={ui} />}
        {activeTab === "riesgo" && <RiesgoTab cliente={cliente} data={data} ui={ui} />}
        {activeTab === "modulos" && <ModulosTab legajo={legajo} data={data} ui={ui} />}
        {activeTab === "cobre" && cliente.pais === "MX" && <CobreTab legajo={cliente.legajo} />}
        {activeTab === "historial" && <HistorialTab data={data} />}
      </div>

      <ClienteModales legajo={legajo} cliente={cliente} data={data} ui={ui} />
    </div>
  );
}
