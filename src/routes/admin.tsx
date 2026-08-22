import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, Save, Loader2, Copy, ChevronLeft, ChevronRight } from "lucide-react";

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

interface ItemImage {
  id: string;
  url: string;
  sort_order: number;
}

interface Item {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  sort_order: number;
  image_url: string | null;
  image_url_2: string | null;
  images: ItemImage[];
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
    const { data } = await supabase
      .from("auction_items")
      .select("*, auction_item_images(id, url, sort_order)")
      .order("sort_order");
    setItems(
      ((data ?? []) as any[]).map((row) => ({
        ...row,
        images: ((row.auction_item_images ?? []) as ItemImage[])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order),
      })) as Item[],
    );
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
  const [images, setImages] = useState<ItemImage[]>(item.images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function syncCover(list: ItemImage[]) {
    await supabase
      .from("auction_items")
      .update({
        image_url: list[0]?.url ?? null,
        image_url_2: list[1]?.url ?? null,
      })
      .eq("id", item.id);
  }

  async function reloadImages() {
    const { data } = await supabase
      .from("auction_item_images")
      .select("id, url, sort_order")
      .eq("item_id", item.id)
      .order("sort_order");
    const list = (data ?? []) as ItemImage[];
    setImages(list);
    await syncCover(list);
    return list;
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("auction_items").update({
      title,
      description,
      starting_price: Number(startingPrice),
      sort_order: Number(sortOrder),
      image_url: images[0]?.url ?? null,
      image_url_2: images[1]?.url ?? null,
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
    const { data: created, error } = await supabase.from("auction_items").insert({
      title: `${title} (copia)`,
      description,
      starting_price: Number(startingPrice),
      sort_order: nextOrder,
      image_url: images[0]?.url ?? null,
      image_url_2: images[1]?.url ?? null,
    }).select("id").single();
    if (!error && created && images.length) {
      await supabase.from("auction_item_images").insert(
        images.map((img, i) => ({ item_id: created.id, url: img.url, sort_order: i })),
      );
    }
    setDuplicating(false);
    if (error) return toast.error(error.message);
    toast.success("Artículo duplicado");
    onChange();
  }

  async function uploadFiles(files: FileList) {
    setUploading(true);
    let order = images.length;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${item.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("auction-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: signed, error: signErr } = await supabase.storage
        .from("auction-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signErr || !signed) { toast.error(signErr?.message ?? "No se pudo firmar la URL"); continue; }
      const { error: insErr } = await supabase.from("auction_item_images").insert({
        item_id: item.id,
        url: signed.signedUrl,
        sort_order: order++,
      });
      if (insErr) toast.error(insErr.message);
    }
    await reloadImages();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Fotos actualizadas");
  }

  async function removeImage(img: ItemImage) {
    const { error } = await supabase.from("auction_item_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    const rest = images.filter((i) => i.id !== img.id);
    await Promise.all(
      rest.map((i, idx) =>
        supabase.from("auction_item_images").update({ sort_order: idx }).eq("id", i.id),
      ),
    );
    await reloadImages();
    toast.success("Foto eliminada");
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const list = images.slice();
    [list[index], list[target]] = [list[target], list[index]];
    setImages(list);
    await Promise.all(
      list.map((i, idx) =>
        supabase.from("auction_item_images").update({ sort_order: idx }).eq("id", i.id),
      ),
    );
    await reloadImages();
  }

  return (
    <div className="ornament-border rounded-xl bg-card p-5 shadow-deep">
      <div className="grid gap-5 sm:grid-cols-[440px_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-gold-soft/70">
              Galería ({images.length} {images.length === 1 ? "foto" : "fotos"}) · la primera es la portada
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div key={img.id} className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-gold/20 bg-obsidian/60">
                  <img src={img.url} alt={`${title} — foto ${idx + 1}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded bg-obsidian/80 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-gold">
                      Portada
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gold/40 text-gold-soft px-1"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    title="Mover antes"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gold/40 text-gold-soft px-1"
                    onClick={() => move(idx, 1)}
                    disabled={idx === images.length - 1}
                    title="Mover después"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-crimson/50 text-crimson hover:bg-crimson/10 px-1"
                    onClick={() => removeImage(img)}
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-3 flex aspect-[3/1] items-center justify-center rounded-lg border border-dashed border-gold/20 text-xs text-muted-foreground">
                Sin fotos
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full border-gold/40 text-gold-soft"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
            Agregar fotos
          </Button>
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
              <Label>N.º de lote</Label>
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

