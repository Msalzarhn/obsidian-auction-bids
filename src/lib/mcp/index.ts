import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAuctionItems from "./tools/list-auction-items";
import listMyBids from "./tools/list-my-bids";
import placeBid from "./tools/place-bid";

// The OAuth issuer must be the direct Supabase host — the published proxy
// origin fails RFC 8414 issuer matching. Read the project ref from the
// Vite-inlined env; the fallback keeps the issuer well-formed during the
// throwaway manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "obsidiana-auction-mcp",
  title: "Subasta Daga de Obsidiana",
  version: "0.1.0",
  instructions:
    "Herramientas para la subasta benéfica del Capítulo Daga de Obsidiana. Usa list_auction_items para ver los objetos, list_my_bids para ver tus pujas, y place_bid para pujar por un objeto. Debes iniciar sesión como usuario de la app.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAuctionItems, listMyBids, placeBid],
});
