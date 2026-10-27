import { useState } from "react";

/** Estado de los diálogos de la vista de desarrollador (logs y ejecuciones manuales). */
export function useControlesTecnicos() {
  const [showLogs, setShowLogs] = useState(false);
  const [logNivel, setLogNivel] = useState("INFO");
  const [logRetencion, setLogRetencion] = useState("7");
  const [showEjecutarEspecifico, setShowEjecutarEspecifico] = useState(false);
  const [loginSeleccionado, setLoginSeleccionado] = useState("pct:wondersoft");
  const [confirmEjecutarTodos, setConfirmEjecutarTodos] = useState(false);

  return {
    showLogs,
    setShowLogs,
    logNivel,
    setLogNivel,
    logRetencion,
    setLogRetencion,
    showEjecutarEspecifico,
    setShowEjecutarEspecifico,
    loginSeleccionado,
    setLoginSeleccionado,
    confirmEjecutarTodos,
    setConfirmEjecutarTodos,
  };
}

export type ControlesTecnicos = ReturnType<typeof useControlesTecnicos>;
