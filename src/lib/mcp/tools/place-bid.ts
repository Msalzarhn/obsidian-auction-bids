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
  name: "place_bid",
  title: "Place a bid",
  description:
    "Place a bid on an auction item as the signed-in user. Amount must be strictly greater than the current highest bid (or the starting price if there are no bids).",
  inputSchema: {
    item_id: z.string().uuid().describe("UUID of the auction item to bid on."),
    amount: z.number().positive().describe("Bid amount in HNL (Lempiras). Must beat the current highest bid."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ item_id, amount }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const userId = ctx.getUserId()!;
    const supabase = supabaseForUser(ctx);

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name,logia")
      .eq("id", userId)
      .maybeSingle();
    if (profileErr) return { content: [{ type: "text", text: profileErr.message }], isError: true };
    if (!profile) {
      return {
        content: [
          {
            type: "text",
            text: "No profile found. Complete your registration in the app before bidding.",
          },
        ],
        isError: true,
      };
    }

    const { data, error } = await supabase
      .from("bids")
      .insert({
        item_id,
        user_id: userId,
        bidder_name: profile.full_name,
        bidder_logia: profile.logia,
        amount,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Bid placed: L. ${amount} on item ${item_id}` }],
      structuredContent: { bid: data },
    };
  },
});
