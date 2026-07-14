import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gavel, Trophy, User } from "lucide-react";
import type { Profile } from "@/hooks/use-auth";

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  sort_order: number;
  image_url?: string | null;
}

export interface Bid {
  id: string;
  item_id: string;
  bidder_name: string;
  bidder_logia: string;
  amount: number;
  created_at: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", maximumFractionDigits: 0 }).format(n);

export function ItemCard({
  item,
  bids,
  onBid,
}: {
  item: AuctionItem;
  bids: Bid[];
  onBid: (item: AuctionItem, currentMax: number) => void;
}) {
  const sorted = useMemo(() => [...bids].sort((a, b) => b.amount - a.amount), [bids]);
  const top = sorted[0];
  const currentMax = top?.amount ?? item.starting_price;
  const bidCount = bids.length;

  return (
    <div className="ornament-border group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-deep transition-transform hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-royal">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gavel className="h-20 w-20 text-gold/40" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        <div className="absolute top-3 right-3 rounded-full bg-obsidian/80 backdrop-blur px-3 py-1 text-xs text-gold-soft border border-gold/30">
          {bidCount} {bidCount === 1 ? "puja" : "pujas"}
        </div>
        <div className="absolute top-3 left-3 rounded-full bg-obsidian/80 backdrop-blur px-3 py-1 text-xs text-parchment border border-gold/20 font-display">
          Lote #{item.sort_order}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl text-parchment leading-tight">{item.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.description}</p>

        <div className="mt-4 rounded-lg border border-gold/20 bg-obsidian/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {top ? "Puja actual" : "Puja inicial"}
          </div>
          <div className="font-display text-2xl text-gradient-gold">{fmt(currentMax)}</div>
          {top && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gold-soft/80">
              <Trophy className="h-3 w-3" /> {top.bidder_name} · {top.bidder_logia}
            </div>
          )}
        </div>

        {sorted.length > 1 && (
          <div className="mt-3 space-y-1 max-h-24 overflow-y-auto pr-1">
            {sorted.slice(1, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-1">
                <span className="flex items-center gap-1 truncate">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{b.bidder_name}</span>
                </span>
                <span className="tabular-nums text-parchment">{fmt(b.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => onBid(item, currentMax)}
          className="mt-4 bg-gradient-to-r from-secondary to-crimson-deep text-parchment border border-gold/40 hover:opacity-90 font-display tracking-wider"
        >
          <Gavel className="mr-2 h-4 w-4" /> Pujar
        </Button>
      </div>
    </div>
  );
}

export function BidDialog({
  open,
  onOpenChange,
  item,
  currentMax,
  profile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: AuctionItem | null;
  currentMax: number;
  profile: Profile | null;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setAmount(String(Math.ceil((currentMax + 100) / 50) * 50));
  }, [open, currentMax]);

  if (!item) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !item) return;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= currentMax) {
      toast.error(`La puja debe ser mayor a ${fmt(currentMax)}`);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bids").insert({
      item_id: item.id,
      user_id: profile.id,
      bidder_name: profile.full_name,
      bidder_logia: profile.logia,
      amount: n,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Puja registrada!");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-gold/30">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-gold">{item.title}</DialogTitle>
          <DialogDescription>
            Puja actual: <span className="text-parchment font-semibold">{fmt(currentMax)}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Tu puja (Lempiras)</Label>
            <Input
              id="amount"
              type="number"
              min={currentMax + 1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-xl font-display"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Debe ser mayor a {fmt(currentMax)}.
            </p>
          </div>
          <div className="rounded-md border border-gold/20 bg-obsidian/50 p-3 text-xs text-muted-foreground">
            Al ganar, deberás pagar el monto ofertado directamente al tesorero de la
            R:.L:.S:. Igualdad No. 1. Los fondos apoyan al Capítulo Daga de Obsidiana, DeMolay.
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-display tracking-wider">
            <Gavel className="mr-2 h-4 w-4" />
            {loading ? "Registrando..." : "Confirmar puja"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
