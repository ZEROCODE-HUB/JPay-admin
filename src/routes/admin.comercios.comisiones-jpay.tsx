import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  BtnOutline,
  BtnPrimary,
  Card,
  Input,
  Label,
  PageHeader,
  Stat,
} from "@/components/portal-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { brand, pageTitle } from "@/brand/brand";
import {
  getComisionesJpay,
  listPagosComisiones,
  registrarPagoComisiones,
  type FilaComision,
} from "@/lib/api/comisiones-jpay";
import { formatDate, formatMoney, formatNumber, parseMonto } from "@/shared/format";
import { FormDialog } from "@/shared/ui/form-dialog";
import { InfoTip } from "@/shared/ui/info-tip";

export const Route = createFileRoute("/admin/comercios/comisiones-jpay")({
  head: () => ({ meta: [{ title: pageTitle(`Comisiones de ${brand.name} — Admin`) }] }),
  component: Page,
});

const PROVEEDOR = { ecartpay: "Ecart Pay", cobre: "Cobre" } as const;

const hoy = () => new Date().toISOString().slice(0, 10);
const inicioMes = () => `${hoy().slice(0, 8)}01`;

function descargarCsv(nombre: string, filas: FilaComision[]) {
  const enc = [
    "Proveedor",
    "Producto",
    "Número de cliente",
    "Comercio",
    "Operaciones",
    "Base",
    "Comisión",
    "IVA",
    "Total",
    "Forma",
  ];
  const lineas = filas.map((f) =>
    [
      PROVEEDOR[f.proveedor],
      f.producto,
      f.legajo,
      f.nombre,
      f.operaciones,
      f.base.toFixed(2),
      f.comision.toFixed(2),
      f.iva.toFixed(2),
      (f.comision + f.iva).toFixed(2),
      f.forma === "descontada" ? "Descontada del saldo" : "Por cobrar",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[enc.join(","), ...lineas].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Calculadora de comisiones de JPay: cuánto le corresponde por comercio y producto en un
 * período, cuánto ya pagó cada proveedor y la diferencia. JPay no toca dinero: Ecart Pay le paga
 * la suma de sus comisiones; con Cobre se le pide a cada empresa (o se descontó del saldo).
 */
function Page() {
  const qc = useQueryClient();
  const [desde, setDesde] = useState(inicioMes());
  const [hasta, setHasta] = useState(hoy());
  const [registrar, setRegistrar] = useState(false);
  const calc = useQuery({
    queryKey: ["comisiones-jpay", desde, hasta],
    queryFn: () => getComisionesJpay(desde, hasta),
    enabled: !!desde && !!hasta && desde <= hasta,
  });
  const pagos = useQuery({
    queryKey: ["comisiones-jpay", "pagos", desde, hasta],
    queryFn: () => listPagosComisiones(desde, hasta),
    enabled: !!desde && !!hasta && desde <= hasta,
  });
  const filas = useMemo(() => calc.data ?? [], [calc.data]);

  const totales = useMemo(() => {
    const t = (pred: (f: FilaComision) => boolean) =>
      filas.filter(pred).reduce((s, f) => s + f.comision + f.iva, 0);
    const recibido = (p: "ecartpay" | "cobre") =>
      (pagos.data ?? []).filter((x) => x.proveedor === p).reduce((s, x) => s + x.monto, 0);
    return {
      ecart: t((f) => f.proveedor === "ecartpay"),
      cobrePorCobrar: t((f) => f.proveedor === "cobre" && f.forma === "por_cobrar"),
      cobreDescontada: t((f) => f.proveedor === "cobre" && f.forma === "descontada"),
      recibidoEcart: recibido("ecartpay"),
      recibidoCobre: recibido("cobre"),
    };
  }, [filas, pagos.data]);

  const m = (n: number) => formatMoney(n, { moneda: "MXN" });

  return (
    <PermissionGuard recurso="comercios">
      <PageHeader
        title={`Comisiones de ${brand.name}`}
        description={`Cuánto le corresponde a ${brand.name} por comercio y producto, y cuánto ya se cobró.`}
        action={
          <div className="flex gap-2">
            <BtnOutline
              disabled={!filas.length}
              onClick={() => descargarCsv(`comisiones_jpay_${desde}_${hasta}.csv`, filas)}
            >
              <Download size={14} /> CSV
            </BtnOutline>
            <BtnPrimary onClick={() => setRegistrar(true)}>
              <Plus size={14} /> Registrar pago recibido
            </BtnPrimary>
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="cj-desde">Desde</Label>
            <Input
              id="cj-desde"
              type="date"
              className="mt-1"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cj-hasta">Hasta</Label>
            <Input
              id="cj-hasta"
              type="date"
              className="mt-1"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Ecart Pay: comisión de {brand.name} sobre lo cobrado (neto de reembolsos), según la
            configuración de cobros o la propia del comercio. Cobre: según el modo (descontada del
            saldo o por cobrar). Todo con IVA.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Stat
          label="Ecart Pay · por cobrar"
          info={`Comisión de ${brand.name} + IVA sobre los cobros con Ecart Pay pagados en el período (enlaces de pago y POS, neto de reembolsos) y sobre suscripciones y domiciliaciones cobradas. Usa el porcentaje propio del comercio o, si no tiene, el general de México. «Recibido» suma los pagos registrados a mano cuyo período se cruza con el elegido.`}
          value={m(totales.ecart)}
          sub={`Recibido ${m(totales.recibidoEcart)} · falta ${m(Math.max(0, totales.ecart - totales.recibidoEcart))}`}
        />
        <Stat
          label="Cobre · por cobrar"
          info="Comisión + IVA de depósitos, transferencias y conversiones a dólares contabilizados en el período que NO se descontaron del saldo del comercio (modo «calcular»): hay que pedírsela a cada empresa. «Recibido» suma los pagos de empresas registrados a mano."
          value={m(totales.cobrePorCobrar)}
          sub={`Recibido ${m(totales.recibidoCobre)} · falta ${m(Math.max(0, totales.cobrePorCobrar - totales.recibidoCobre))}`}
        />
        <Stat
          label="Cobre · descontada del saldo"
          info="Comisión + IVA que ya se descontó del saldo del comercio en cada depósito, transferencia o conversión contabilizada en el período (modo «descontar»). No hay que cobrarla aparte."
          value={m(totales.cobreDescontada)}
          sub="Ya cobrada en cada operación"
        />
        <Stat
          label="Total del período"
          info="Suma de las tres tarjetas anteriores (comisión + IVA). Abajo, la cantidad de operaciones con comisión que entraron en el cálculo. Fechas en hora de México."
          value={m(totales.ecart + totales.cobrePorCobrar + totales.cobreDescontada)}
          sub={`${formatNumber(filas.reduce((s, f) => s + f.operaciones, 0))} operaciones`}
        />
      </div>

      <Card className="mb-4">
        <h3 className="font-semibold mb-3">Detalle por comercio y producto</h3>
        {calc.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : calc.isError ? (
          <p className="text-sm text-danger-600">{(calc.error as Error).message}</p>
        ) : filas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin operaciones con comisión en el período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground text-left">
                <tr>
                  <th className="py-2 pr-3">Proveedor</th>
                  <th className="py-2 pr-3">Producto</th>
                  <th className="py-2 pr-3">Comercio</th>
                  <th className="py-2 pr-3 text-right">Operaciones</th>
                  <th className="py-2 pr-3 text-right">Base</th>
                  <th className="py-2 pr-3 text-right">Comisión</th>
                  <th className="py-2 pr-3 text-right">IVA</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                  <th className="py-2">Forma</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr
                    key={`${f.proveedor}-${f.producto}-${f.legajo}-${f.forma}`}
                    className="border-t border-border"
                  >
                    <td className="py-2 pr-3">{PROVEEDOR[f.proveedor]}</td>
                    <td className="py-2 pr-3">{f.producto}</td>
                    <td className="py-2 pr-3">
                      {f.nombre}
                      <span className="block font-mono text-xs text-muted-foreground">
                        {f.legajo}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatNumber(f.operaciones)}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono">{m(f.base)}</td>
                    <td className="py-2 pr-3 text-right font-mono">{m(f.comision)}</td>
                    <td className="py-2 pr-3 text-right font-mono">{m(f.iva)}</td>
                    <td className="py-2 pr-3 text-right font-mono font-semibold">
                      {m(f.comision + f.iva)}
                    </td>
                    <td className="py-2">
                      <Badge tone={f.forma === "descontada" ? "neutral" : "warn"}>
                        {f.forma === "descontada" ? "Descontada" : "Por cobrar"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">
          Pagos recibidos en el período{" "}
          <InfoTip>
            Pagos de comisiones que alguien registró a mano con «Registrar pago recibido» (de Ecart
            Pay o de cada empresa en Cobre) y cuyo período se cruza con las fechas elegidas.
          </InfoTip>
        </h3>
        {pagos.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (pagos.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no se registraron pagos.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {pagos.data!.map((p) => (
              <li key={p.id} className="py-2 flex flex-wrap items-center justify-between gap-3">
                <span>
                  {PROVEEDOR[p.proveedor]}
                  {p.legajo && <span className="font-mono text-xs"> · {p.legajo}</span>}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    · período {formatDate(p.desde)} a {formatDate(p.hasta)} · pagado{" "}
                    {formatDate(p.fechaPago)}
                    {p.referencia && ` · ref. ${p.referencia}`}
                  </span>
                </span>
                <span className="font-mono font-semibold">{m(p.monto)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <RegistrarPagoDialog
        open={registrar}
        desde={desde}
        hasta={hasta}
        onClose={() => setRegistrar(false)}
        onGuardado={() => {
          setRegistrar(false);
          qc.invalidateQueries({ queryKey: ["comisiones-jpay"] });
        }}
      />
    </PermissionGuard>
  );
}

function RegistrarPagoDialog({
  open,
  desde,
  hasta,
  onClose,
  onGuardado,
}: {
  open: boolean;
  desde: string;
  hasta: string;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [f, setF] = useState({
    proveedor: "ecartpay" as "ecartpay" | "cobre",
    legajo: "",
    monto: "",
    fechaPago: hoy(),
    referencia: "",
    nota: "",
  });
  const guardar = useMutation({
    mutationFn: () =>
      registrarPagoComisiones({
        proveedor: f.proveedor,
        legajo: f.proveedor === "cobre" ? f.legajo.trim() || null : null,
        desde,
        hasta,
        monto: parseMonto(f.monto),
        fechaPago: f.fechaPago,
        referencia: f.referencia,
        nota: f.nota,
      }),
    onSuccess: () => {
      toast.success("Pago registrado");
      onGuardado();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Registrar pago recibido"
      description={`Pago de comisiones del período ${formatDate(desde)} a ${formatDate(hasta)}.`}
      submitLabel="Registrar"
      isSubmitting={guardar.isPending}
      onSubmit={() => {
        if (!(parseMonto(f.monto) > 0)) return toast.error("Monto inválido");
        guardar.mutate();
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="rp-prov">Quién pagó</Label>
          <select
            id="rp-prov"
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-card text-sm"
            value={f.proveedor}
            onChange={(e) => setF({ ...f, proveedor: e.target.value as "ecartpay" | "cobre" })}
          >
            <option value="ecartpay">Ecart Pay</option>
            <option value="cobre">Empresa (Cobre)</option>
          </select>
        </div>
        {f.proveedor === "cobre" && (
          <div>
            <Label htmlFor="rp-legajo">Número de cliente de la empresa</Label>
            <Input
              id="rp-legajo"
              className="mt-1"
              value={f.legajo}
              onChange={(e) => setF({ ...f, legajo: e.target.value })}
            />
          </div>
        )}
        <div>
          <Label htmlFor="rp-monto">Monto (MXN)</Label>
          <Input
            id="rp-monto"
            className="mt-1"
            inputMode="decimal"
            value={f.monto}
            onChange={(e) => setF({ ...f, monto: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="rp-fecha">Fecha del pago</Label>
          <Input
            id="rp-fecha"
            type="date"
            className="mt-1"
            value={f.fechaPago}
            onChange={(e) => setF({ ...f, fechaPago: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="rp-ref">Referencia (opcional)</Label>
          <Input
            id="rp-ref"
            className="mt-1"
            value={f.referencia}
            onChange={(e) => setF({ ...f, referencia: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="rp-nota">Nota (opcional)</Label>
          <Input
            id="rp-nota"
            className="mt-1"
            value={f.nota}
            onChange={(e) => setF({ ...f, nota: e.target.value })}
          />
        </div>
      </div>
    </FormDialog>
  );
}
