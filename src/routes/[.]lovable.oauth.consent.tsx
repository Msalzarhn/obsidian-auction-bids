import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthClient = {
  name?: string;
  client_name?: string;
  redirect_uri?: string;
};

type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

function isSameOriginRelative(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/login", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-xl text-foreground">No pudimos cargar esta autorización</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "una aplicación externa";
  const redirectUri = details?.client?.redirect_uri;
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(" ").filter(Boolean) : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no devolvió una URL de redirección.");
      return;
    }
    if (isSameOriginRelative(target)) {
      window.location.href = target;
    } else {
      window.location.href = target;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-lg border border-gold/30 bg-card p-6 shadow-lg">
        <h1 className="font-display text-2xl text-gradient-gold">
          Conectar {clientName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} podrá usar las herramientas de la Subasta Daga de Obsidiana actuando como tú
          {email ? ` (${email})` : ""}.
        </p>
        {redirectUri && (
          <p className="mt-3 text-xs text-muted-foreground break-all">
            Redirección: <span className="font-mono">{redirectUri}</span>
          </p>
        )}
        {scopes.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-foreground">
            {scopes.map((s) => (
              <li key={s} className="text-muted-foreground">• {s}</li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Esto no otorga permisos por encima de lo que ya puedes hacer en la app: las políticas de
          acceso siguen aplicándose.
        </p>
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>
        )}
        <div className="mt-6 flex gap-2">
          <Button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
          >
            {busy ? "Procesando..." : "Aprobar"}
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => decide(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </main>
  );
}
