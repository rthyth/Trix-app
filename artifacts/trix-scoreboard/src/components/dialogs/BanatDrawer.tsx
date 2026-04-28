import { useEffect, useMemo, useState } from 'react';
import { Player, Doubling } from '@/lib/types';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { computeBanatScores } from '@/lib/scoring';
import { Heart, Plus, Minus, Trash2, Zap } from 'lucide-react';

interface BanatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onConfirm: (
    scores: Record<string, number>,
    doublings: Doubling[],
    doublingScores: Record<string, number>,
  ) => void;
}

const QUEEN_LABELS = ['الكوبا', 'البستوني', 'السباتي', 'الديناري'];

export function BanatDrawer({ open, onOpenChange, players, onConfirm }: BanatDrawerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [doublings, setDoublings] = useState<Doubling[]>([]);
  // Pending doubling being constructed
  const [pendingDoubler, setPendingDoubler] = useState<string | null>(null);
  const [pendingTaker, setPendingTaker] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCounts({});
      setDoublings([]);
      setPendingDoubler(null);
      setPendingTaker(null);
    }
  }, [open]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isCountsValid = total === 4;

  // Doubled-queen takers must not exceed each player's actual queen count.
  const takerCountsInDoublings = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of doublings) m[d.takerId] = (m[d.takerId] || 0) + 1;
    return m;
  }, [doublings]);

  const doublingsValid = players.every(
    (p) => (takerCountsInDoublings[p.id] || 0) <= (counts[p.id] || 0),
  );

  const canConfirm = isCountsValid && doublingsValid;

  const updateCount = (id: string, delta: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > 4) return prev;
      if (total + delta > 4) return prev;
      // Don't allow shrinking below the count of doubled queens already
      // assigned to this player as taker.
      if (next < (takerCountsInDoublings[id] || 0)) return prev;
      return { ...prev, [id]: next };
    });
  };

  const canAddPending =
    !!pendingDoubler &&
    !!pendingTaker &&
    doublings.length < 4 &&
    // taker must still have room for one more doubled queen
    (takerCountsInDoublings[pendingTaker] || 0) < (counts[pendingTaker] || 0);

  const addDoubling = () => {
    if (!canAddPending || !pendingDoubler || !pendingTaker) return;
    setDoublings((prev) => [
      ...prev,
      { doublerId: pendingDoubler, takerId: pendingTaker },
    ]);
    setPendingDoubler(null);
    setPendingTaker(null);
  };

  const removeDoubling = (idx: number) => {
    setDoublings((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const queenCounts: Record<string, number> = {};
    players.forEach((p) => {
      queenCounts[p.id] = counts[p.id] || 0;
    });
    const { scores, doublingScores } = computeBanatScores(queenCounts, doublings);
    onConfirm(scores, doublings, doublingScores);
    onOpenChange(false);
  };

  const playerName = (id: string) => players.find((p) => p.id === id)?.name || '';

  // Live preview of final scores
  const previewScores = (() => {
    if (!isCountsValid) return null;
    const queenCounts: Record<string, number> = {};
    players.forEach((p) => {
      queenCounts[p.id] = counts[p.id] || 0;
    });
    const { scores, doublingScores } = computeBanatScores(queenCounts, doublings);
    const merged: Record<string, number> = {};
    players.forEach((p) => {
      merged[p.id] = (scores[p.id] || 0) + (doublingScores[p.id] || 0);
    });
    return merged;
  })();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 fill-primary" />
            البنات
            {doublings.length > 0 && (
              <span className="ml-1 inline-flex items-center gap-1 text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse">
                <Zap className="w-3 h-3 fill-primary" />
                {doublings.length === 1 ? 'بنت مكبوسة' : `${doublings.length} كبسات`} ×٢
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Counts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-bold">من أخذ كم بنت؟</p>
              <span
                className={`text-sm font-bold ${
                  isCountsValid ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {total} / 4
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              أي لاعب يمكن أن يأخذ بنات — بما فيهم من كبس.
            </p>
            <div className="space-y-2">
              {players.map((p) => {
                const isInDoublings =
                  doublings.some((d) => d.doublerId === p.id || d.takerId === p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-card border rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{p.name}</span>
                      {isInDoublings && <Zap className="w-3.5 h-3.5 text-primary fill-primary" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full"
                        onClick={() => updateCount(p.id, 1)}
                        disabled={total >= 4}
                        data-testid={`button-banat-plus-${p.id}`}
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                      <span className="text-xl font-bold w-6 text-center">
                        {counts[p.id] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full"
                        onClick={() => updateCount(p.id, -1)}
                        disabled={!counts[p.id]}
                        data-testid={`button-banat-minus-${p.id}`}
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doublings */}
          <div className="space-y-3 p-3 rounded-xl border border-border bg-card/40">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold">البنات المكبوسة</p>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              فقط من معه البنت يكبسها قبل اللعب. حتى ٤ بنات.
            </p>

            {/* Existing doublings */}
            {doublings.length > 0 && (
              <div className="space-y-2">
                {doublings.map((d, i) => {
                  const sameTakerAsDoubler = d.doublerId === d.takerId;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-background border border-primary/30 rounded-lg"
                      data-testid={`row-banat-doubling-${i}`}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs font-bold text-muted-foreground">
                          {QUEEN_LABELS[i]}
                        </span>
                        <span className="font-bold">{playerName(d.doublerId)}</span>
                        <span className="text-muted-foreground text-xs">كبس →</span>
                        <span className="font-bold text-primary">{playerName(d.takerId)}</span>
                        {sameTakerAsDoubler && (
                          <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                            بلعها
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeDoubling(i)}
                        data-testid={`button-remove-banat-doubling-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add doubling form */}
            {doublings.length < 4 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-muted-foreground">
                  إضافة بنت مكبوسة
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">من كبس</p>
                    <div className="grid grid-cols-2 gap-1">
                      {players.map((p) => (
                        <Button
                          key={p.id}
                          variant={pendingDoubler === p.id ? 'default' : 'outline'}
                          size="sm"
                          className="h-9 text-xs"
                          onClick={() => setPendingDoubler(p.id)}
                          data-testid={`button-pending-doubler-${p.id}`}
                        >
                          {p.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">من أخذها</p>
                    <div className="grid grid-cols-2 gap-1">
                      {players.map((p) => {
                        const room =
                          (counts[p.id] || 0) - (takerCountsInDoublings[p.id] || 0);
                        const disabled = room <= 0;
                        return (
                          <Button
                            key={p.id}
                            variant={pendingTaker === p.id ? 'default' : 'outline'}
                            size="sm"
                            className="h-9 text-xs"
                            disabled={disabled}
                            onClick={() => setPendingTaker(p.id)}
                            data-testid={`button-pending-taker-${p.id}`}
                          >
                            {p.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-9 mt-1"
                  disabled={!canAddPending}
                  onClick={addDoubling}
                  data-testid="button-add-banat-doubling"
                >
                  <Plus className="ml-1 w-4 h-4" />
                  إضافة
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          {previewScores && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs font-bold text-muted-foreground mb-2">المعاينة</p>
              <div className="grid grid-cols-2 gap-2">
                {players.map((p) => {
                  const v = previewScores[p.id] || 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span
                        className={`font-bold ${
                          v > 0
                            ? 'text-primary'
                            : v < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {v > 0 ? `+${v}` : v}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DrawerFooter>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full text-lg"
            data-testid="button-confirm-banat"
          >
            تأكيد
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
