import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Shield, Mail, MapPin, Plane, FileText, Lock, UserCheck, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

const CANONICAL_URL = "https://obsidian-auction-bids.lovable.app/privacidad";

export const Route = createFileRoute("/privacidad")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Políticas de Privacidad · Subasta Daga de Obsidiana" },
      {
        name: "description",
        content:
          "Políticas de privacidad, manejo de datos personales y términos de envío de la subasta benéfica del Capítulo Daga de Obsidiana, Orden DeMolay de Honduras.",
      },
      { property: "og:title", content: "Políticas de Privacidad · Subasta Daga de Obsidiana" },
      {
        property: "og:description",
        content:
          "Conoce cómo protegemos tus datos y las condiciones de envío para ganadores internacionales.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Políticas de Privacidad · Subasta Daga de Obsidiana" },
      {
        name: "twitter:description",
        content:
          "Conoce cómo protegemos tus datos y las condiciones de envío para ganadores internacionales.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Políticas de Privacidad · Subasta Daga de Obsidiana",
          description:
            "Políticas de privacidad, manejo de datos personales y términos de envío de la subasta benéfica del Capítulo Daga de Obsidiana.",
          url: CANONICAL_URL,
          isPartOf: {
            "@type": "WebSite",
            name: "Subasta Daga de Obsidiana",
            url: "https://obsidian-auction-bids.lovable.app/",
          },
        }),
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="font-display text-sm text-gradient-gold hover:opacity-90 transition"
          >
            ← Volver a la subasta
          </Link>
          <span className="text-xs uppercase tracking-widest text-muted-foreground hidden sm:inline">
            Capítulo Daga de Obsidiana
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <Reveal immediate>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-royal border border-gold/30 mb-6">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display text-gradient-gold mb-4">
              Políticas de Privacidad
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Subasta benéfica organizada por la R:.L:.S:.M:. Igualdad No. 1 a favor del Capítulo Daga de Obsidiana, Orden DeMolay de Honduras.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Última actualización: 1 de septiembre de 2026
            </p>
          </div>
        </Reveal>

        <div className="space-y-8">
          <Reveal>
            <PolicyCard
              icon={<FileText className="h-6 w-6 text-gold" />}
              title="1. Identidad del responsable"
            >
              El responsable del tratamiento de los datos personales recabados a través de este sitio es la{" "}
              <strong className="text-parchment">R:.L:.S:.M:. Igualdad No. 1</strong>, con sede en Tegucigalpa, Honduras, en coordinación con el{" "}
              <strong className="text-parchment">Capítulo Daga de Obsidiana</strong>{" "}
              de la Orden DeMolay de Honduras. Los datos se utilizan exclusivamente para la organización y ejecución de la subasta benéfica.
            </PolicyCard>
          </Reveal>

          <Reveal>
            <PolicyCard
              icon={<UserCheck className="h-6 w-6 text-gold" />}
              title="2. Datos que recopilamos"
            >
              Para permitir el registro y la participación en las pujas en vivo, solicitamos:
              <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
                <li>Nombre completo.</li>
                <li>Correo electrónico.</li>
                <li>Número de teléfono celular.</li>
                <li>Logia, capítulo u organización masónica a la que pertenece.</li>
              </ul>
              Estos datos son necesarios para identificar a los postores, mostrar las pujas en tiempo real y contactar a los ganadores.
            </PolicyCard>
          </Reveal>

          <Reveal>
            <PolicyCard
              icon={<Lock className="h-6 w-6 text-gold" />}
              title="3. Finalidad y protección de los datos"
            >
              Los datos personales se utilizan únicamente para:
              <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
                <li>Gestionar el registro de usuarios en la plataforma.</li>
                <li>Mostrar en tiempo real el nombre, la logia y el monto de cada puja.</li>
                <li>Contactar a los ganadores al finalizar la subasta.</li>
                <li>Coordinar el pago y la entrega de los artículos adjudicados.</li>
              </ul>
              No compartimos tu información con terceros ajenos a la organización de la subasta, ni la utilizamos para fines publicitarios.
            </PolicyCard>
          </Reveal>

          <Reveal>
            <PolicyCard
              icon={<UserCheck className="h-6 w-6 text-gold" />}
              title="4. Derechos de los usuarios"
            >
              Como usuario registrado tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales. Para ejercer estos derechos, escríbenos al correo de contacto indicado al final de esta página. Conservamos los datos mientras sean necesarios para cumplir con los fines de la subasta y las obligaciones legales correspondientes.
            </PolicyCard>
          </Reveal>

          <Reveal>
            <div className="ornament-border rounded-xl bg-card p-6 sm:p-8 shadow-deep border-gold/40">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-royal border border-gold/30 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display text-gradient-gold mb-3">
                    5. Envíos internacionales
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Los artículos que hayan sido ganados por hermanos que residan{" "}
                    <strong className="text-parchment">fuera de la República de Honduras</strong>{" "}
                    podrán ser enviados a su país de destino. El{" "}
                    <strong className="text-parchment">Q:.H:.S:. (Querido Hermano Secretario)</strong>{" "}
                    se encargará de gestionar y coordinar el envío; sin embargo,{" "}
                    <strong className="text-parchment">
                      todos los costos de envío correrán por cuenta del acreedor o ganador del artículo
                    </strong>
                    . El pago de dichos costos deberá realizarse antes de que el paquete sea despachado.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <PolicyCard
              icon={<Trash2 className="h-6 w-6 text-gold" />}
              title="6. Conservación y eliminación"
            >
              Mantendremos tus datos personales únicamente durante el tiempo necesario para completar la subasta, contactar a los ganadores, coordinar pagos y entregas, y atender cualquier reclamo posterior. Una vez cumplidos estos fines, los datos serán eliminados o anonimizados de forma segura.
            </PolicyCard>
          </Reveal>

          <Reveal>
            <PolicyCard
              icon={<Mail className="h-6 w-6 text-gold" />}
              title="7. Contacto"
            >
              Para cualquier consulta, ejercicio de derechos o aclaración sobre estas políticas, puedes contactarnos a través de los canales oficiales de la R:.L:.S:.M:. Igualdad No. 1 o del Capítulo Daga de Obsidiana.
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold-soft" />
                <span>Tegucigalpa, Honduras</span>
              </div>
            </PolicyCard>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 font-display tracking-wider"
            >
              Volver a la subasta
            </Link>
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-gold/20 bg-obsidian">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <p className="font-display text-sm text-gradient-gold">Virtus et Honos</p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Capítulo Daga de Obsidiana · Organizado por la
            R:.L:.S:.M:. Igualdad No. 1 · Tegucigalpa, Honduras
          </p>
        </div>
      </footer>
    </div>
  );
}

function PolicyCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="ornament-border rounded-xl bg-card p-6 sm:p-8 shadow-deep">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-royal border border-gold/30 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-display text-gradient-gold mb-3">{title}</h2>
          <div className="text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
