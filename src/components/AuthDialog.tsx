import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  full_name: z.string().trim().min(3, "Ingresa tu nombre completo").max(120),
  email: z.string().trim().email("Correo inválido").max(200),
  phone: z.string().trim().min(7, "Número inválido").max(30),
  logia: z.string().trim().min(2, "Ingresa tu logia u organización").max(120),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "Requerido"),
});

export function AuthDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "register",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: "register" | "login";
}) {
  const [tab, setTab] = useState<"register" | "login">(defaultTab);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { full_name, email, phone, logia, password } = parsed.data;
    const redirect = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirect,
        data: { full_name, phone, logia },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("¡Registro exitoso! Ya puedes pujar.");
    onOpenChange(false);
    onSuccess?.();
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bienvenido de vuelta");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-gold/30">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-gradient-gold">
            Acceso a la Subasta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Regístrate para pujar por los objetos ceremoniales.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "register" | "login")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="register">Registrarme</TabsTrigger>
            <TabsTrigger value="login">Ingresar</TabsTrigger>
          </TabsList>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3 mt-4">
              <div>
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input id="full_name" name="full_name" required maxLength={120} />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required maxLength={200} />
              </div>
              <div>
                <Label htmlFor="phone">Número de celular</Label>
                <Input id="phone" name="phone" type="tel" required maxLength={30} placeholder="+504 9999-9999" />
              </div>
              <div>
                <Label htmlFor="logia">Logia a la que pertenece</Label>
                <Input id="logia" name="logia" required maxLength={120} placeholder="Ej. R:.L:.S:. Igualdad No. 1" />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required minLength={6} maxLength={72} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:opacity-90">
                {loading ? "Creando cuenta..." : "Crear cuenta y pujar"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3 mt-4">
              <div>
                <Label htmlFor="l-email">Correo electrónico</Label>
                <Input id="l-email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="l-password">Contraseña</Label>
                <Input id="l-password" name="password" type="password" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:opacity-90">
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
