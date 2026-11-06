import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  Headphones,
  Shield,
  FileBarChart2,
  Puzzle,
  Link2,
  Receipt,
  Code2,
  Settings,
  Cable,
  BellRing,
  UserCog,
  Store,
  MapPinned,
  Repeat,
  Landmark,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCheck,
  Inbox,
  Send,
  DollarSign,
  Scale,
  ShieldAlert,
  Wallet,
  CreditCard,
  CircleDollarSign,
  Megaphone,
} from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";
import { useDemoMode } from "@/contexts/demo-mode";
import { usePaisConModulos } from "@/shared/modulos-pais";
import { filtrarPorModulo } from "@/shared/pais";
import { RouteSkeleton } from "@/shared/ui/route-skeleton";
import { AdminChatbot } from "@/components/admin-chatbot";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { brand } from "@/brand/brand";
import { usePendientesAprobacion } from "@/hooks/useCobre";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  pendingComponent: RouteSkeleton,
});

// Cada ítem con `modulo` aparece solo si el país lo tiene prendido (`paises.modulos`).
// Agrupado por lo que se quiere hacer (cobrar, enviar, controlar), no por proveedor.
const APROBACIONES = "/admin/envios/aprobaciones";

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Clientes",
    icon: Users,
    items: [
      { to: "/admin/general/usuarios", label: "Clientes", icon: Users },
      { to: "/admin/comercios/gestion", label: "Comercios", icon: Store },
      { to: "/admin/general/usuarios/clabe", label: "Usuarios con CLABE", icon: Landmark },
    ],
  },
  {
    label: "Cobros",
    icon: ArrowDownToLine,
    items: [
      {
        to: "/admin/general/movimientos/depositos",
        label: "Depósitos SPEI",
        icon: ArrowDownToLine,
      },
      {
        to: "/admin/cobros/sin-asignar",
        label: "Depósitos sin asignar",
        icon: Inbox,
        modulo: "transferencias_cobre",
      },
      { to: "/admin/comercios/link-pago", label: "Links de pago", icon: Link2 },
      {
        to: "/admin/comercios/recurrentes",
        label: "Suscripciones y domiciliación",
        icon: Repeat,
        modulo: "suscripciones",
      },
      { to: "/admin/comercios/pos", label: "POS físico", icon: MapPinned, modulo: "pos" },
    ],
  },
  {
    label: "Envíos",
    icon: ArrowUpFromLine,
    items: [
      {
        to: APROBACIONES,
        label: "Aprobaciones pendientes",
        icon: CheckCheck,
        modulo: "transferencias_cobre",
      },
      {
        to: "/admin/general/movimientos/transferencias",
        label: "Transferencias",
        icon: Send,
        modulo: "transferencias_cobre",
      },
      {
        to: "/admin/general/movimientos/conversiones",
        label: "Conversiones a dólares",
        icon: DollarSign,
        modulo: "transferencias_cobre",
      },
    ],
  },
  {
    label: "Control",
    icon: Shield,
    items: [
      { to: "/admin/control/conciliacion", label: "Conciliación", icon: Scale },
      {
        to: "/admin/control/disputas",
        label: "Contracargos y reembolsos",
        icon: CreditCard,
        modulo: "pagos_proveedor",
      },
      {
        to: "/admin/general/alertas",
        label: "Alertas y bloqueos",
        icon: ShieldAlert,
        modulo: "monitoreo_automatico",
      },
      { to: "/admin/general/movimientos", label: "Movimientos (todos)", icon: Activity },
    ],
  },
  {
    label: "Finanzas JPay",
    icon: CircleDollarSign,
    items: [
      { to: "/admin/finanzas/comisiones", label: "Comisiones", icon: Receipt },
      { to: "/admin/administracion/registros", label: "Fondos", icon: Wallet },
      { to: "/admin/administracion/reportes", label: "Reportes", icon: FileBarChart2 },
    ],
  },
  {
    label: "Sistema",
    icon: Settings,
    items: [
      { to: "/admin/configuracion", label: "Integraciones", icon: Cable },
      { to: "/admin/modulos", label: "Salud de módulos", icon: Puzzle },
      { to: "/admin/notificaciones", label: "Notificaciones", icon: BellRing },
      { to: "/admin/administracion/usuarios", label: "Usuarios backoffice", icon: UserCog },
      { to: "/admin/administracion/soporte", label: "Soporte", icon: Headphones },
      { to: "/admin/incidentes", label: "Comunicación de incidentes", icon: Megaphone },
      { to: "/admin/comercios/apis", label: "APIs externas", icon: Code2 },
    ],
  },
];

/** Pone el contador de envíos por aprobar en su ítem del menú. */
const conContador = (nav: NavItem[], pendientes: number): NavItem[] =>
  pendientes > 0
    ? nav.map((i) =>
        "items" in i
          ? {
              ...i,
              items: i.items.map((l) => (l.to === APROBACIONES ? { ...l, badge: pendientes } : l)),
            }
          : i,
      )
    : nav;

function AdminLayout() {
  const pais = usePaisConModulos();
  const pendientes = usePendientesAprobacion(
    isSupabaseConfigured && !!pais.modulos.transferencias_cobre,
  );
  const nav = useMemo(
    () => conContador(filtrarPorModulo(NAV, pais), pendientes),
    [pais, pendientes],
  );
  const { role, setRole } = useDemoMode();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (role !== "admin" && role !== "operador") setRole("admin");
  }, [role, setRole]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setAuthChecked(true);
      else navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) setAuthChecked(true);
      else navigate({ to: "/" });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (!authChecked) return <RouteSkeleton />;

  return (
    <PortalShell nav={nav} title={`Backoffice ${brand.name}`}>
      <Outlet />
      <AdminChatbot />
    </PortalShell>
  );
}
