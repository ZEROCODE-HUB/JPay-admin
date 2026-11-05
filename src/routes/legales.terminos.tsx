import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/legales/terminos")({
  head: () => ({
    meta: [
      { title: pageTitle("Términos y Condiciones") },
      {
        name: "description",
        content: `Términos y condiciones de uso de la plataforma ${brand.shortName}.`,
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-6 py-16 prose prose-sm">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Terminos y Condiciones
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          ultima actualizacion: <span className="font-mono tabular-nums">01/06/2026</span>
        </p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Objeto</h2>
            <p>
              {brand.company.legalName} (en adelante "{brand.company.shortName}") ofrece servicios
              de cobro y pago a empresas en México. Estos términos regulan el uso de la plataforma
              por parte de personas morales.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              2. Registro y verificacion
            </h2>
            <p>
              El titular debera completar el proceso de conocimiento del cliente (KYC/KYB) y aportar
              la documentacion societaria requerida.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              3. Uso de la cuenta de pago
            </h2>
            <p>
              Los fondos depositados no constituyen depósitos bancarios. {brand.company.shortName}{" "}
              mantiene el 100% de los fondos de los clientes en cuentas en entidades financieras del
              sistema financiero mexicano.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              4. Comisiones
            </h2>
            <p>
              Las comisiones aplicables se detallan en la{" "}
              <Link to="/legales/comisiones" className="text-primary-ink underline">
                Tabla de Comisiones
              </Link>
              , la cual forma parte integrante de estos terminos.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              5. Rescision
            </h2>
            <p>
              El usuario podrá dar de baja la cuenta en cualquier momento comunicándose con nuestro
              equipo.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              6. Jurisdiccion
            </h2>
            <p>
              Para cualquier controversia se aplicarán las leyes de los Estados Unidos Mexicanos y
              serán competentes los tribunales de la Ciudad de México.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
