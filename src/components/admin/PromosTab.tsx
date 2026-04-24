import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreVertical, Pencil, Pause, Play, Copy, Trash2, ImageIcon, Megaphone, ListOrdered, Pin, PinOff, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePromosAdmin } from "@/hooks/usePromosAdmin";
import type { Promo } from "@/hooks/useActivePromo";
import {
  usePromoSortStrategy,
  PROMO_SORT_STRATEGY_LABELS,
  PROMO_SORT_STRATEGY_DESCRIPTIONS,
  type PromoSortStrategy,
} from "@/hooks/usePromoSortStrategy";
import PromoEditor from "./PromoEditor";

type PromoStatus = "active" | "upcoming" | "expired" | "paused";

function getStatus(p: Promo): PromoStatus {
  if (!p.is_active) return "paused";
  const now = Date.now();
  const from = new Date(p.active_from).getTime();
  const to = new Date(p.active_to).getTime();
  if (now > to) return "expired";
  if (now < from) return "upcoming";
  return "active";
}

const STATUS_ORDER: Record<PromoStatus, number> = {
  active: 0,
  upcoming: 1,
  expired: 2,
  paused: 3,
};

function formatPeriod(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const sameYear = f.getFullYear() === t.getFullYear();
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  return `${fmt(f, !sameYear)} — ${fmt(t, true)}`;
}

const StatusBadge = ({ status }: { status: PromoStatus }) => {
  const map: Record<PromoStatus, { label: string; emoji: string; cls: string }> = {
    active: { label: "Aktiv", emoji: "🟢", cls: "bg-green-500/10 text-green-400 border-green-500/30" },
    upcoming: { label: "Kommande", emoji: "🟡", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    expired: { label: "Utgången", emoji: "⚫", cls: "bg-muted/30 text-muted-foreground border-border" },
    paused: { label: "Pausad", emoji: "⏸️", cls: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  };
  const s = map[status];
  return (
    <Badge variant="outline" className={s.cls}>
      <span className="mr-1">{s.emoji}</span>
      {s.label}
    </Badge>
  );
};

/**
 * Compute the display order of currently-active promos using the same
 * pinned-first + strategy logic as the public site (mirrors useActivePromo).
 * Returns a Map from promo.id → 1-based rank for quick lookup.
 */
function computeActiveQueue(promos: Promo[], strategy: PromoSortStrategy): Promo[] {
  const active = promos.filter((p) => getStatus(p) === "active");
  const pinned = active.filter((p) => p.pinned_to_top);
  const rest = active.filter((p) => !p.pinned_to_top);
  const sortFn = (a: Promo, b: Promo) => {
    switch (strategy) {
      case "priority":
        return (
          b.priority - a.priority ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "nearest_end":
        return (
          new Date(a.active_to).getTime() - new Date(b.active_to).getTime() ||
          b.priority - a.priority
        );
      case "nearest_start":
        return (
          new Date(b.active_from).getTime() - new Date(a.active_from).getTime() ||
          b.priority - a.priority
        );
      case "rotation":
        return a.id.localeCompare(b.id);
    }
  };
  return [...pinned.sort(sortFn), ...rest.sort(sortFn)];
}

const PromosTab = () => {
  const { promos, isLoading, deletePromo, togglePromoActive, togglePromoPin, duplicatePromo } = usePromosAdmin();
  const { strategy, setStrategy, isSaving } = usePromoSortStrategy();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Promo | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState<Promo | null>(null);

  // Display-order queue (only currently active promos), mirrors the public site.
  const activeQueue = useMemo(() => computeActiveQueue(promos, strategy), [promos, strategy]);
  const rankById = useMemo(() => {
    const map = new Map<string, number>();
    activeQueue.forEach((p, i) => map.set(p.id, i + 1));
    return map;
  }, [activeQueue]);

  // Admin list ordering: status group, then rank within active group.
  const sorted = useMemo(() => {
    return [...promos].sort((a, b) => {
      const sa = getStatus(a);
      const sb = getStatus(b);
      if (STATUS_ORDER[sa] !== STATUS_ORDER[sb]) return STATUS_ORDER[sa] - STATUS_ORDER[sb];
      if (sa === "active") {
        const ra = rankById.get(a.id) ?? 999;
        const rb = rankById.get(b.id) ?? 999;
        if (ra !== rb) return ra - rb;
      }
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [promos, rankById]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (p: Promo) => {
    setEditing(p);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Sort strategy selector — global, applies when several promos overlap */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-primary" />
            <CardTitle className="font-display text-base">Sorteringsstrategi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Bestämmer vilken kampanj som visas först när flera är aktiva samtidigt.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Select
              value={strategy}
              onValueChange={(v) => setStrategy(v as PromoSortStrategy)}
              disabled={isSaving}
            >
              <SelectTrigger className="sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROMO_SORT_STRATEGY_LABELS) as PromoSortStrategy[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {PROMO_SORT_STRATEGY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground sm:flex-1">
              {PROMO_SORT_STRATEGY_DESCRIPTIONS[strategy]}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <CardTitle className="font-display text-neon-gradient">Reklam & Kampanjer</CardTitle>
          </div>
          <Button onClick={openCreate} className="bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/40">
            <Plus className="w-4 h-4 mr-1.5" />
            Skapa ny kampanj
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laddar…</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Inga kampanjer ännu. Klicka "Skapa ny kampanj" för att börja.
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((p) => {
                const status = getStatus(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-card/60 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 flex items-center justify-center">
                      {p.flyer_image_url ? (
                        <img src={p.flyer_image_url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{p.title}</div>
                      {p.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{p.subtitle}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatPeriod(p.active_from, p.active_to)}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {p.source === "calendar" ? "Kalender" : "Manuell"}
                      </Badge>
                      <StatusBadge status={status} />
                    </div>

                    {/* Actions */}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4 mr-2" /> Redigera
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePromoActive.mutate({ id: p.id, is_active: !p.is_active })}
                        >
                          {p.is_active ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" /> Pausa
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Aktivera
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmDuplicate(p)}>
                          <Copy className="w-4 h-4 mr-2" /> Duplicera
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setConfirmDelete(p)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Ta bort
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PromoEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        promo={editing ?? undefined}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort kampanj?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" tas bort permanent. Detta kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) deletePromo.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate confirmation */}
      <AlertDialog open={!!confirmDuplicate} onOpenChange={(v) => !v && setConfirmDuplicate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicera kampanj?</AlertDialogTitle>
            <AlertDialogDescription>
              En kopia av "{confirmDuplicate?.title}" skapas som pausad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDuplicate) duplicatePromo.mutate(confirmDuplicate.id);
                setConfirmDuplicate(null);
              }}
            >
              Duplicera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromosTab;
