import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_auction_items",
  title: "List auction items",
  description:
    "List every auction item (title, description, starting price, image) together with the current highest bid so far.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: items, error: itemsErr } = await supabase
      .from("auction_items")
      .select("id,title,description,starting_price,image_url,sort_order")
      .order("sort_order", { ascending: true });
    if (itemsErr) return { content: [{ type: "text", text: itemsErr.message }], isError: true };

    const { data: bids, error: bidsErr } = await supabase
      .from("bids")
      .select("item_id,amount");
    if (bidsErr) return { content: [{ type: "text", text: bidsErr.message }], isError: true };

    const maxByItem = new Map<string, number>();
    for (const b of bids ?? []) {
      const cur = maxByItem.get(b.item_id) ?? 0;
      if (b.amount > cur) maxByItem.set(b.item_id, b.amount);
    }

    const rows = (items ?? []).map((it) => ({
      ...it,
      current_highest_bid: maxByItem.get(it.id) ?? null,
      minimum_next_bid: (maxByItem.get(it.id) ?? it.starting_price) + 1,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { items: rows },
    };
  },
});
