import { useEffect, useState } from 'react';
import { Player, Doubling } from '@/lib/types';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { computeSheikhScores } from '@/lib/scoring';
import { Crown, Zap } from 'lucide-react';

interface SheikhDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onConfirm: (
    scores: Record<string, number>,
    doublings: Doubling[],
    doublingScores: Record<string, number>,
  ) => void;
}

export function SheikhDrawer({ open, onOpenChange, players, onConfirm }: SheikhDrawerProps) {
  const [isDoubled, setIsDoubled] = useState(false);
  const [doublerId, setDoublerId] = useState<string | null>(null);
  const [takerId, setTakerId] = useState<string | null>(null);

  // Reset state whenever the drawer is reopened
  useEffect(() => {
    if (open) {
      setIsDoubled(false);
      setDoublerId(null);
      setTakerId(null);
    }
  }, [open]);

  const canConfirm = !!takerId && (!isDoubled || !!doublerId);

  const handleConfirm = () => {
    if (!canConfirm || !takerId) return;
    const doublings: Doubling[] =
      isDoubled && doublerId ? [{ doublerId, takerId }] : [];
    const { scores, doublingScores } = computeSheikhScores(takerId, doublings);
    onConfirm(scores, doublings, doublingScores);
    onOpenChange(false);
  };

  // Per-player projected score for preview
  const previewScores = (() => {
    if (!takerId) return null;
    const doublings: Doubling[] =
      isDoubled && doublerId ? [{ doublerId, takerId }] : [];
    const { scores, doublingScores } = computeSheikhScores(takerId, doublings);
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
            <Crown className="w-6 h-6" />
            الشيخ
            {isDoubled && (
              <span className="ml-1 inline-flex items-center gap-1 text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full animate-pulse">
                <Zap className="w-3 h-3 fill-primary" />
                مكبوسة ×٢
              </span>
            )}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Doubling section */}
          <div
            className={`p-4 rounded-xl border-2 transition-all ${
              isDoubled
                ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(201,169,97,0.18)]'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isDoubled ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                <span className="font-bold text-base">
                  هل تم تضعيف الشيخ (كبس)؟
                </span>
              </div>
              <Switch
                checked={isDoubled}
                onCheckedChange={(v) => {
                  setIsDoubled(v);
                  if (!v) setDoublerId(null);
                }}
                data-testid="switch-sheikh-doubled"
              />
            </div>

            {isDoubled && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  من معه الشيخ وقام بكبسه؟
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {players.map((p) => (
                    <Button
                      key={p.id}
                      variant={doublerId === p.id ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => setDoublerId(p.id)}
                      data-testid={`button-sheikh-doubler-${p.id}`}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Taker section */}
          <div className="space-y-3">
            <p className="text-base font-bold">من أخذ الشيخ؟</p>
            <p className="text-xs text-muted-foreground -mt-2">
              يمكن لأي لاعب أن يأخذها — حتى من كبس.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {players.map((p) => {
                const isThisDoubler = isDoubled && doublerId === p.id;
                return (
                  <Button
                    key={p.id}
                    variant={takerId === p.id ? 'default' : 'outline'}
                    className={`relative h-16 text-lg ${
                      takerId === p.id ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setTakerId(p.id)}
                    data-testid={`button-sheikh-taker-${p.id}`}
                  >
                    {isThisDoubler && (
                      <Zap
                        className={`absolute top-1.5 right-2 w-3.5 h-3.5 ${
                          takerId === p.id ? 'text-primary-foreground' : 'text-primary fill-primary'
                        }`}
                      />
                    )}
                    {p.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {previewScores && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <p className="text-xs font-bold text-muted-foreground mb-2">
                المعاينة
              </p>
              <div className="grid grid-cols-2 gap-2">
                {players.map((p) => {
                  const v = previewScores[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{p.name}</span>
                      <span
                        className={`font-bold ${
                          v > 0 ? 'text-primary' : v < 0 ? 'text-destructive' : 'text-muted-foreground'
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
            data-testid="button-confirm-sheikh"
          >
            تأكيد
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
