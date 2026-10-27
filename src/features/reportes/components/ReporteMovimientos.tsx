import { useState } from "react";
import { Download, Search } from "lucide-react";
import { BtnOutline, Input, Label } from "@/components/portal-shell";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { downloadExcel } from "@/features/reportes/utils/download";
import { esCuitValido, normalizarCuit } from "@/features/reportes/utils/periodos";

/* ---------- Reportes de Movimientos (CUIT) ---------- */

type Movimiento = {
  coelsaId: string;
  legajo: string;
  email: string;
  cvu: string;
  dia: string;
  hora: string;
  tipo: "Depósito" | "Retiro";
  monto: string;
  cvuRemitente: string;
  cuitRemitente: string;
  nombreRemitente: string;
};

const MOVIMIENTOS: Record<string, Movimiento[]> = {
  "30123456789": [
    {
      coelsaId: "COELSA-0001",
      legajo: "LPF-20123456789",
      email: "jperez@email.com",
      cvu: "1234567890123456789012",
      dia: "2026-07-28",
      hora: "14:32",
      tipo: "Depósito",
      monto: "$ 50.000",
      cvuRemitente: "1234567890123456789012",
      cuitRemitente: "30123456789",
      nombreRemitente: "Juan Pérez",
    },
    {
      coelsaId: "COELSA-0002",
      legajo: "LPF-20123456789",
      email: "jperez@email.com",
      cvu: "1234567890123456789012",
      dia: "2026-07-26",
      hora: "09:15",
      tipo: "Retiro",
      monto: "$ 5.000",
      cvuRemitente: "1234567890123456789023",
      cuitRemitente: "20123456789",
      nombreRemitente: "María García",
    },
    {
      coelsaId: "COELSA-0003",
      legajo: "LPF-20123456789",
      email: "jperez@email.com",
      cvu: "1234567890123456789012",
      dia: "2026-07-20",
      hora: "10:45",
      tipo: "Depósito",
      monto: "$ 120.000",
      cvuRemitente: "1234567890123456789934",
      cuitRemitente: "30555666777",
      nombreRemitente: "María García",
    },
  ],
  "20123456789": [
    {
      coelsaId: "COELSA-0004",
      legajo: "LPF-27234567890",
      email: "mgarcia@email.com",
      cvu: "1234567890123456789023",
      dia: "2026-07-28",
      hora: "11:00",
      tipo: "Depósito",
      monto: "$ 200.000",
      cvuRemitente: "1234567890123456789012",
      cuitRemitente: "30123456789",
      nombreRemitente: "Juan Pérez",
    },
    {
      coelsaId: "COELSA-0005",
      legajo: "LPF-27234567890",
      email: "mgarcia@email.com",
      cvu: "1234567890123456789023",
      dia: "2026-07-22",
      hora: "08:30",
      tipo: "Retiro",
      monto: "$ 25.000",
      cvuRemitente: "1234567890123456789023",
      cuitRemitente: "30555666777",
      nombreRemitente: "Carlos López",
    },
  ],
  "30987654321": [
    {
      coelsaId: "COELSA-0006",
      legajo: "LPF-20345678901",
      email: "clopez@email.com",
      cvu: "1234567890123456789034",
      dia: "2026-07-25",
      hora: "16:00",
      tipo: "Depósito",
      monto: "$ 75.000",
      cvuRemitente: "1234567890123456789012",
      cuitRemitente: "30123456789",
      nombreRemitente: "Ana Martínez",
    },
  ],
};

const columns: Column<Movimiento>[] = [
  {
    key: "coelsaId",
    label: "ID COELSA",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono text-xs">{r.coelsaId}</span>,
  },
  {
    key: "legajo",
    label: "Legajo",
    sortable: true,
    filterable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.legajo}</span>,
  },
  { key: "email", label: "Email", filterable: true, render: (r) => r.email },
  {
    key: "cvu",
    label: "CVU",
    filterable: true,
    render: (r) => <span className="font-mono text-xs tabular-nums">{r.cvu}</span>,
  },
  {
    key: "dia",
    label: "Día",
    sortable: true,
    filterable: "date",
    render: (r) => <span className="font-mono tabular-nums">{r.dia}</span>,
  },
  {
    key: "hora",
    label: "Hora",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.hora}</span>,
  },
  {
    key: "tipo",
    label: "Tipo",
    sortable: true,
    filterable: "enum",
    filterOptions: ["Depósito", "Retiro"],
    render: (r) => r.tipo,
  },
  {
    key: "monto",
    label: "Monto",
    sortable: true,
    render: (r) => <span className="font-mono tabular-nums">{r.monto}</span>,
  },
  {
    key: "cvuRemitente",
    label: "CVU remitente",
    filterable: true,
    render: (r) => <span className="font-mono text-xs tabular-nums">{r.cvuRemitente || "—"}</span>,
  },
  {
    key: "cuitRemitente",
    label: "CUIT remitente",
    filterable: true,
    render: (r) => <span className="font-mono tabular-nums text-xs">{r.cuitRemitente || "—"}</span>,
  },
  {
    key: "nombreRemitente",
    label: "Nombre remitente",
    filterable: true,
    render: (r) => r.nombreRemitente || "—",
  },
];

export function ReporteMovimientos() {
  const [cuit, setCuit] = useState("");
  const [consulta, setConsulta] = useState("");
  const valido = esCuitValido(cuit);
  const rows = consulta ? (MOVIMIENTOS[consulta] ?? []) : [];

  const excelRows = rows.map((r) => ({
    "ID COELSA": r.coelsaId,
    Legajo: r.legajo,
    Email: r.email,
    CVU: r.cvu,
    Día: r.dia,
    Hora: r.hora,
    Tipo: r.tipo,
    Monto: r.monto,
    "CVU remitente": r.cvuRemitente,
    "CUIT remitente": r.cuitRemitente,
    "Nombre remitente": r.nombreRemitente,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ingresá un CUIT (11 dígitos) para consultar y descargar en Excel los movimientos de personas
        físicas y jurídicas fuera de la plataforma.
      </p>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <Label htmlFor="cuit-mov">CUIT</Label>
          <Input
            id="cuit-mov"
            value={cuit}
            onChange={(e) => {
              const v = normalizarCuit(e.target.value);
              setCuit(v);
              if (v.length !== 11) setConsulta("");
            }}
            placeholder="Ej: 20123456789"
          />
        </div>
        <button
          disabled={!valido}
          onClick={() => setConsulta(cuit)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={14} /> Buscar
        </button>
      </div>
      {cuit.length > 0 && !valido && (
        <p className="text-xs text-amber-600">El CUIT debe tener 11 dígitos numéricos.</p>
      )}
      {valido && consulta && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BtnOutline onClick={() => downloadExcel(`movimientos_${consulta}.xlsx`, excelRows)}>
              <Download size={14} /> Descargar Excel
            </BtnOutline>
            <span className="text-sm text-muted-foreground">
              {rows.length} movimientos encontrados
            </span>
          </div>
        </div>
      )}
      {consulta &&
        valido &&
        (rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No se encontraron movimientos para el CUIT consultado.
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            keyExtractor={(r) => r.coelsaId}
            pageSize={10}
            showDownloadButton={false}
          />
        ))}
    </div>
  );
}
