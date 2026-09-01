import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ReportBid {
  itemId: string;
  lote: number;
  title: string;
  bidderName: string;
  bidderLogia: string;
  email: string;
  phone: string;
  amount: number;
  createdAt: string;
}

export interface ReportWinner {
  lote: number;
  title: string;
  startingPrice: number;
  bidderName: string | null;
  bidderLogia: string | null;
  email: string | null;
  phone: string | null;
  amount: number | null;
  createdAt: string | null;
  totalBids: number;
}

export interface AuctionReport {
  winners: ReportWinner[];
  bids: ReportBid[];
  summary: {
    totalRaised: number;
    itemsSold: number;
    itemsWithoutBids: number;
    uniqueBidders: number;
    totalBids: number;
    generatedAt: string;
  };
}

export const getAuctionReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuctionReport> => {
    const { data: roleRow, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error("No se pudo verificar el rol del usuario");
    if (!roleRow) throw new Error("Forbidden: se requiere rol de administrador");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [itemsRes, bidsRes, profilesRes] = await Promise.all([
      supabaseAdmin.from("auction_items").select("id, title, starting_price, sort_order").order("sort_order"),
      supabaseAdmin.from("bids").select("id, item_id, user_id, bidder_name, bidder_logia, amount, created_at"),
      supabaseAdmin.from("profiles").select("id, email, phone, full_name, logia"),
    ]);

    if (itemsRes.error) throw new Error(itemsRes.error.message);
    if (bidsRes.error) throw new Error(bidsRes.error.message);
    if (profilesRes.error) throw new Error(profilesRes.error.message);

    const items = itemsRes.data ?? [];
    const rawBids = bidsRes.data ?? [];
    const profiles = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const itemById = new Map(items.map((i) => [i.id, i]));

    const bids: ReportBid[] = rawBids
      .map((b) => {
        const item = itemById.get(b.item_id);
        const profile = profiles.get(b.user_id);
        return {
          itemId: b.item_id,
          lote: item?.sort_order ?? 0,
          title: item?.title ?? "(artículo eliminado)",
          bidderName: b.bidder_name,
          bidderLogia: b.bidder_logia,
          email: profile?.email ?? "",
          phone: profile?.phone ?? "",
          amount: Number(b.amount),
          createdAt: b.created_at,
        };
      })
      .sort((a, b) => a.lote - b.lote || b.amount - a.amount);

    const winners: ReportWinner[] = items.map((item) => {
      const itemBids = bids.filter((b) => b.itemId === item.id);
      const top = itemBids[0] ?? null;
      return {
        lote: item.sort_order,
        title: item.title,
        startingPrice: Number(item.starting_price),
        bidderName: top?.bidderName ?? null,
        bidderLogia: top?.bidderLogia ?? null,
        email: top?.email ?? null,
        phone: top?.phone ?? null,
        amount: top?.amount ?? null,
        createdAt: top?.createdAt ?? null,
        totalBids: itemBids.length,
      };
    });

    const sold = winners.filter((w) => w.amount !== null);

    return {
      winners,
      bids,
      summary: {
        totalRaised: sold.reduce((sum, w) => sum + (w.amount ?? 0), 0),
        itemsSold: sold.length,
        itemsWithoutBids: winners.length - sold.length,
        uniqueBidders: new Set(rawBids.map((b) => b.user_id)).size,
        totalBids: rawBids.length,
        generatedAt: new Date().toISOString(),
      },
    };
  });
