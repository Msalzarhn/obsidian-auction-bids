import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/AuthDialog";
import { Countdown } from "@/components/Countdown";
import {
  ItemCard,
  BidDialog,
  type AuctionItem,
  type Bid,
} from "@/components/AuctionItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Sparkles, Calendar, MapPin, Clock, Users, Shield } from "lucide-react";

import heroBg from "@/assets/hero-bg.jpg.asset.json";
import obsidianLogo from "@/assets/capitulo-obsidiana.jpeg.asset.json";
import demolayLogo from "@/assets/demolay.jpeg.asset.json";
import igualdadLogo from "@/assets/logia-igualdad.png.asset.json";
import granLogiaLogo from "@/assets/logo-granlogia.png.asset.json";
import bannerIgualdad from "@/assets/banner-igualdad.jpg.asset.json";

const CANONICAL_URL = "https://obsidian-auction-bids.lovable.app/";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Subasta Masónica · Capítulo Daga de Obsidiana" },
      {
        name: "description",
        content:
          "Subasta benéfica en vivo de objetos masónicos de colección a favor del Capítulo Daga de Obsidiana, Orden DeMolay de Honduras. 31 de agosto de 2026.",
      },
      { property: "og:title", content: "Subasta Masónica · Capítulo Daga de Obsidiana" },
      {
        property: "og:description",
        content:
          "Pujas en tiempo real por objetos y prendas masónicas. Fondos a favor de la Orden DeMolay de Honduras.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { name: "twitter:title", content: "Subasta Masónica · Capítulo Daga de Obsidiana" },
      {
        name: "twitter:description",
        content:
          "Pujas en tiempo real por objetos y prendas masónicas. Fondos a favor de la Orden DeMolay de Honduras.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Subasta Masónica · Capítulo Daga de Obsidiana",
          description:
            "Subasta benéfica de objetos y prendas masónicas a favor del Capítulo Daga de Obsidiana, Orden DeMolay de Honduras.",
          startDate: "2026-09-03T18:00:00-06:00",
          endDate: "2026-09-03T23:59:59-06:00",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: "Templo de la R:.L:.S:.M:. Igualdad No. 1",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Tegucigalpa",
              addressCountry: "HN",
            },
          },
          organizer: {
            "@type": "Organization",
            name: "Capítulo Daga de Obsidiana · Orden DeMolay de Honduras",
            url: CANONICAL_URL,
          },
          url: CANONICAL_URL,
        }),
      },
    ],
  }),
});

function Landing() {
  const { user, profile, isAdmin } = useAuth();
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<AuctionItem | null>(null);
  const [activeMax, setActiveMax] = useState(0);

  useEffect(() => {
    supabase.from("auction_items").select("*").order("sort_order")
      .then(({ data }) => setItems((data ?? []) as AuctionItem[]));
    supabase.from("bids").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setBids((data ?? []) as Bid[]));

    const ch = supabase
      .channel("bids-live")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        (payload) => setBids((prev) => [payload.new as Bid, ...prev]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const bidsByItem = useMemo(() => {
    const m = new Map<string, Bid[]>();
    for (const b of bids) {
      if (!m.has(b.item_id)) m.set(b.item_id, []);
      m.get(b.item_id)!.push(b);
    }
    return m;
  }, [bids]);

  const totalRaised = useMemo(() => {
    let sum = 0;
    for (const it of items) {
      const arr = bidsByItem.get(it.id);
      sum += arr && arr.length ? Math.max(...arr.map(b => b.amount)) : 0;
    }
    return sum;
  }, [items, bidsByItem]);

  function handleBid(item: AuctionItem, currentMax: number) {
    if (!user || !profile) {
      setAuthOpen(true);
      toast.info("Regístrate o inicia sesión para pujar");
      return;
    }
    setActiveItem(item);
    setActiveMax(currentMax);
    setBidOpen(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  }

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={obsidianLogo.url} alt="Capítulo Daga de Obsidiana" className="h-10 w-10 rounded-full ring-1 ring-gold/40" />
            <div className="hidden sm:block leading-tight">
              <div className="font-display text-sm text-gradient-gold">Daga de Obsidiana</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Subasta Benéfica DeMolay</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a href="#lotes" className="hidden sm:inline text-sm text-gold-soft hover:text-gold px-3">Lotes</a>
            <a href="#evento" className="hidden sm:inline text-sm text-gold-soft hover:text-gold px-3">Evento</a>
            {isAdmin && (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-1 text-sm text-gold hover:text-parchment px-3">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user && profile ? (
              <>
                <span className="hidden md:inline text-xs text-muted-foreground pr-2">{profile.full_name}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gold-soft hover:text-gold">
                  <LogOut className="h-4 w-4 mr-1" /> Salir
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)} className="bg-primary text-primary-foreground font-display tracking-wider">
                Registrarme
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15,10,8,0.85), rgba(15,10,8,0.95)), url(${heroBg.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
          {/* Logo principal — Capítulo Daga de Obsidiana */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 -m-6 rounded-full bg-gold/20 blur-2xl" />
              <img
                src={obsidianLogo.url}
                alt="Capítulo Daga de Obsidiana"
                width={224}
                height={224}
                fetchPriority="high"
                className="relative h-40 w-40 sm:h-56 sm:w-56 rounded-full ring-4 ring-gold/60 shadow-gold object-cover"
              />
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.5em] text-gold-soft/90 mb-8">
            Capítulo Daga de Obsidiana · DeMolay
          </div>

          {/* Logos de apoyo */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10 opacity-90">
            <SupportLogo src={granLogiaLogo.url} label="Gran Logia de Honduras" />
            <SupportLogo src={igualdadLogo.url} label="R:.L:.S:.M:. Igualdad No. 1" />
            <SupportLogo src={demolayLogo.url} label="Orden DeMolay" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-obsidian/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-gold-soft">
            <Sparkles className="h-3 w-3" /> Subasta Benéfica · Virtus et Honos
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-6xl md:text-7xl leading-tight">
            <span className="text-parchment">Subasta Masónica a favor del</span>
            <br />
            <span className="text-gradient-gold">Capítulo Daga de Obsidiana</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground">
            Objetos y prendas masónicas de colección. Cada puja apoya la formación
            de los jóvenes de la Orden DeMolay de Honduras.
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.4em] text-gold-soft/80 mb-4">
              Faltan
            </div>
            <Countdown />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-gold" /> Cierre: 31 de agosto de 2026</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-gold" /> Tegucigalpa, Honduras</span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => document.getElementById("lotes")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-primary text-primary-foreground font-display tracking-wider px-8"
            >
              Ver los lotes
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAuthOpen(true)}
                className="border-gold/50 text-gold hover:bg-gold/10 font-display tracking-wider px-8"
              >
                Registrarme para pujar
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <StatCard label="Lotes" value={items.length.toString()} />
            <StatCard label="Pujas" value={bids.length.toString()} />
            <StatCard label="Recaudado" value={new Intl.NumberFormat("es-HN",{style:"currency",currency:"HNL",maximumFractionDigits:0}).format(totalRaised)} />
          </div>
        </div>
      </section>

      {/* LOTES */}
      <section id="lotes" className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.4em] text-gold-soft/80">Objetos en Subasta</div>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl text-gradient-gold">Lotes disponibles</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Las pujas se actualizan en vivo. La puja más alta al cierre del evento gana el lote.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              bids={bidsByItem.get(it.id) ?? []}
              onBid={handleBid}
            />
          ))}
        </div>
      </section>

      {/* EVENTO */}
      <section id="evento" className="bg-royal border-y border-gold/20">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <div className="grid gap-10 sm:grid-cols-2 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-gold-soft/80">Sobre el Evento</div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-gradient-gold">
                Una noche de tradición y filantropía
              </h2>
              <p className="mt-4 text-muted-foreground">
                Organizada por la Centenaria y Respetable Logia Simbólica
                <span className="text-parchment"> Igualdad No. 1</span>, esta subasta reúne
                piezas ceremoniales cuidadosamente donadas por hermanos y coleccionistas.
              </p>
              <p className="mt-3 text-muted-foreground">
                El total recaudado se destina íntegramente al Capítulo
                <span className="text-parchment"> Daga de Obsidiana</span> de la Orden DeMolay
                de Honduras, para apoyar la formación de los jóvenes bajo el lema
                <span className="italic text-gold-soft"> Virtus et Honos</span>.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-parchment">
                <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> Lunes 31 de agosto de 2026</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Templo Masónico · Tegucigalpa</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> Abierto a hermanos y familiares invitados</li>
              </ul>
            </div>

            <div className="ornament-border rounded-xl bg-obsidian/80 p-8 shadow-gold">
              <h3 className="font-display text-xl text-gradient-gold">Cómo participar</h3>
              <ol className="mt-4 space-y-4 text-sm text-parchment">
                <Step n={1} title="Regístrate">Nombre, correo, celular y logia. Solo toma un minuto.</Step>
                <Step n={2} title="Puja en vivo">Ofrece por uno o varios lotes. Las pujas se ven en tiempo real.</Step>
                <Step n={3} title="Gana el lote">Al cierre, la puja más alta se lleva la pieza.</Step>
                <Step n={4} title="Realiza el pago">Coordinas el pago directamente con el tesorero de la R:.L:.S:. Igualdad No. 1.</Step>
              </ol>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gold/20 bg-obsidian">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <div className="flex justify-center gap-6 mb-4 opacity-80">
            <img src={demolayLogo.url} alt="" className="h-12 rounded" />
            <img src={obsidianLogo.url} alt="" className="h-12 rounded" />
            <img src={igualdadLogo.url} alt="" className="h-12" />
          </div>
          <p className="font-display text-sm text-gradient-gold">Virtus et Honos</p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Capítulo Daga de Obsidiana · Organizado por la
            R:.L:.S:. Igualdad No. 1 · Tegucigalpa, Honduras
          </p>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <BidDialog
        open={bidOpen}
        onOpenChange={setBidOpen}
        item={activeItem}
        currentMax={activeMax}
        profile={profile}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ornament-border rounded-lg bg-obsidian/60 p-4">
      <div className="font-display text-xl sm:text-2xl text-gradient-gold tabular-nums">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function SupportLogo({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img src={src} alt={label} className="h-16 sm:h-20 w-auto object-contain" />
      <div className="text-[10px] uppercase tracking-widest text-gold-soft/70 max-w-[10rem]">{label}</div>
    </div>
  );
}

function SupportLogoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-dashed border-gold/40 bg-obsidian/40 flex items-center justify-center">
        <Landmark className="h-8 w-8 text-gold/50" />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gold-soft/70 max-w-[10rem]">{label}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-gold to-crimson flex items-center justify-center font-display text-obsidian text-sm">
        {n}
      </div>
      <div>
        <div className="font-display text-parchment">{title}</div>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </li>
  );
}
