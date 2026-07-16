import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, Save, Loader2, Copy } from "lucide-react";

const ADMIN_URL = "https://obsidian-auction-bids.lovable.app/admin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Panel de Control · Subasta Daga de Obsidiana" },
      {
        name: "description",
        content:
          "Panel de administración interno para gestionar los objetos de la subasta benéfica del Capítulo Daga de Obsidiana.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Panel de Control · Subasta Daga de Obsidiana" },
      {
        property: "og:description",
        content: "Herramienta interna para administrar los lotes de la subasta.",
      },
      { property: "og:url", content: ADMIN_URL },
    ],
    links: [{ rel: "canonical", href: ADMIN_URL }],
  }),
});

interface Item {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  sort_order: number;
  image_url: string | null;
  image_url_2: string | null;
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      toast.error("Acceso restringido a administradores");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  async function refresh() {
    setFetching(true);
    const { data } = await supabase.from("auction_items").select("*").order("sort_order");
    setItems((data ?? []) as Item[]);
    setFetching(false);
  }

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  async function addItem() {
    const next = (items.reduce((m, it) => Math.max(m, it.sort_order), 0)) + 1;
    const { error } = await supabase.from("auction_items").insert({
      title: "Nuevo artículo",
      description: "Descripción por editar",
      starting_price: 100,
      sort_order: next,
    });
    if (error) return toast.error(error.message);
    toast.success("Artículo creado");
    refresh();
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gold-soft hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Volver al sitio
          </Link>
          <div className="font-display text-gradient-gold">Panel de administración</div>
          <Button size="sm" onClick={addItem} className="bg-primary text-primary-foreground font-display tracking-wider">
            <Plus className="h-4 w-4 mr-1" /> Nuevo
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl sm:text-4xl text-gradient-gold">Artículos en subasta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Edita título, descripción, precio base y foto de cada lote.</p>
        </div>

        {fetching ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : (
          <div className="grid gap-6">
            {items.map((it) => (
              <ItemEditor key={it.id} item={it} onChange={refresh} />
            ))}
            {items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No hay artículos todavía.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ItemEditor({ item, onChange }: { item: Item; onChange: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [startingPrice, setStartingPrice] = useState(String(item.starting_price));
  const [sortOrder, setSortOrder] = useState(String(item.sort_order));
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url);
  const [imageUrl2, setImageUrl2] = useState<string | null>(item.image_url_2);
  const [saving, setSaving] = useState(false);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("auction_items").update({
      title,
      description,
      starting_price: Number(startingPrice),
      sort_order: Number(sortOrder),
      image_url: imageUrl,
      image_url_2: imageUrl2,
    }).eq("id", item.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Guardado");
    onChange();
  }

  async function remove() {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    setDeleting(true);
    const { error } = await supabase.from("auction_items").delete().eq("id", item.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    onChange();
  }

  async function duplicate() {
    setDuplicating(true);
    const { data: maxRow } = await supabase
      .from("auction_items")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.sort_order ?? 0) + 1;
    const { error } = await supabase.from("auction_items").insert({
      title: `${title} (copia)`,
      description,
      starting_price: Number(startingPrice),
      sort_order: nextOrder,
      image_url: imageUrl,
      image_url_2: imageUrl2,
    });
    setDuplicating(false);
    if (error) return toast.error(error.message);
    toast.success("Artículo duplicado");
    onChange();
  }

  async function uploadFile(
    file: File,
    slot: 1 | 2,
  ) {
    const setUploading = slot === 1 ? setUploading1 : setUploading2;
    const setImg = slot === 1 ? setImageUrl : setImageUrl2;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${item.id}/slot${slot}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("auction-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: signed, error: signErr } = await supabase.storage
      .from("auction-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    setUploading(false);
    if (signErr || !signed) return toast.error(signErr?.message ?? "No se pudo firmar la URL");
    setImg(signed.signedUrl);
    toast.success(`Foto ${slot} lista — recuerda pulsar Guardar`);
  }

  return (
    <div className="ornament-border rounded-xl bg-card p-5 shadow-deep">
      <div className="grid gap-5 sm:grid-cols-[440px_1fr]">
        <div className="grid grid-cols-2 gap-3">
          <PhotoSlot
            label="Foto 1"
            imageUrl={imageUrl}
            uploading={uploading1}
            fileRef={fileRef1}
            onFile={(f) => uploadFile(f, 1)}
            onClear={() => setImageUrl(null)}
          />
          <PhotoSlot
            label="Foto 2"
            imageUrl={imageUrl2}
            uploading={uploading2}
            fileRef={fileRef2}
            onFile={(f) => uploadFile(f, 2)}
            onClear={() => setImageUrl2(null)}
          />
        </div>

        <div className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Precio base (L.)</Label>
              <Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground font-display tracking-wider">
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Guardar
            </Button>
            <Button variant="outline" onClick={duplicate} disabled={duplicating} className="border-gold/40 text-gold-soft hover:bg-gold/10">
              {duplicating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Copy className="h-4 w-4 mr-1" />}
              Duplicar
            </Button>
            <Button variant="outline" onClick={remove} disabled={deleting} className="border-crimson/60 text-crimson hover:bg-crimson/10">
              {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({
  label,
  imageUrl,
  uploading,
  fileRef,
  onFile,
  onClear,
}: {
  label: string;
  imageUrl: string | null;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-gold-soft/70">{label}</div>
      <div className="aspect-square rounded-lg border border-gold/20 bg-obsidian/60 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">Sin foto</span>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gold/40 text-gold-soft"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
          {imageUrl ? "Cambiar" : "Subir"}
        </Button>
        {imageUrl && (
          <Button
            variant="outline"
            size="sm"
            className="border-crimson/50 text-crimson hover:bg-crimson/10 px-2"
            onClick={onClear}
            title="Quitar foto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
