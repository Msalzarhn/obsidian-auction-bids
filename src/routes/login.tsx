import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";

function isSafeNext(next: string | undefined): next is string {
  return !!next && next.startsWith("/") && !next.startsWith("//");
}

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();

  const target = isSafeNext(next) ? next : "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = target;
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) window.location.href = target;
    });
    return () => sub.subscription.unsubscribe();
  }, [target]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-gradient-gold">Ingresa para continuar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Necesitas iniciar sesión para autorizar esta conexión.
        </p>
      </div>
      <AuthDialog
        open
        onOpenChange={(open) => {
          if (!open) navigate({ to: "/" });
        }}
        onSuccess={() => {
          window.location.href = target;
        }}
        defaultTab="login"
      />
    </main>
  );
}
