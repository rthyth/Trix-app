import { useState } from 'react';
import { Player, Doubling, Team, GameMode } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Zap } from 'lucide-react';

interface DoublingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  teams?: Team[];
  mode: GameMode;
  doublings: Doubling[];
  onChange: (doublings: Doubling[]) => void;
  contractName: string;
}

export function DoublingDrawer({
  open,
  onOpenChange,
  players,
  teams,
  mode,
  doublings,
  onChange,
  contractName,
}: DoublingDrawerProps) {
  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [redoubled, setRedoubled] = useState(false);

  const playerName = (id: string) => players.find((p) => p.id === id)?.name ?? '';

  const sameTeam = (a: string, b: string): boolean => {
    if (mode !== 'partnership' || !teams) return false;
    const ta = teams.find((t) => t.playerIds.includes(a));
    const tb = teams.find((t) => t.playerIds.includes(b));
    return !!ta && !!tb && ta.id === tb.id;
  };

  const eligibleTo = (from: string | null) => {
    if (!from) return [] as Player[];
    return players.filter((p) => p.id !== from && !sameTeam(from, p.id));
  };

  const isDuplicate = (from: string, to: string) =>
    doublings.some(
      (d) =>
        (d.fromPlayerId === from && d.toPlayerId === to) ||
        (d.fromPlayerId === to && d.toPlayerId === from),
    );

  const addDoubling = () => {
    if (!fromId || !toId) return;
    if (isDuplicate(fromId, toId)) return;
    onChange([...doublings, { fromPlayerId: fromId, toPlayerId: toId, redoubled }]);
    setFromId(null);
    setToId(null);
    setRedoubled(false);
  };

  const removeDoubling = (idx: number) => {
    onChange(doublings.filter((_, i) => i !== idx));
  };

  const canAdd = !!fromId && !!toId && !isDuplicate(fromId, toId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center">
            التضعيف · {contractName}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Existing doublings */}
          {doublings.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground px-1">التضعيفات الحالية</p>
              {doublings.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-card border border-primary/20 rounded-xl"
                  data-testid={`row-doubling-${i}`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold">
                      {playerName(d.fromPlayerId)} ضعّف {playerName(d.toPlayerId)}
                    </span>
                    {d.redoubled && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                        ردّ ×٤
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeDoubling(i)}
                    data-testid={`button-remove-doubling-${i}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* From */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground px-1">المُضعِّف</p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => (
                <Button
                  key={p.id}
                  variant={fromId === p.id ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => {
                    setFromId(p.id);
                    if (toId && (toId === p.id || sameTeam(p.id, toId))) setToId(null);
                  }}
                  data-testid={`button-doubling-from-${p.id}`}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>

          {/* To */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground px-1">المُضعَّف عليه</p>
            <div className="grid grid-cols-2 gap-2">
              {eligibleTo(fromId).map((p) => (
                <Button
                  key={p.id}
                  variant={toId === p.id ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setToId(p.id)}
                  data-testid={`button-doubling-to-${p.id}`}
                >
                  {p.name}
                </Button>
              ))}
              {!fromId && (
                <p className="col-span-2 text-center text-xs text-muted-foreground py-2">
                  اختر المُضعِّف أولاً
                </p>
              )}
            </div>
          </div>

          {/* Redouble toggle */}
          <Button
            variant={redoubled ? 'default' : 'outline'}
            className="w-full h-12 text-base"
            onClick={() => setRedoubled((v) => !v)}
            data-testid="button-toggle-redouble"
          >
            <Zap className="ml-2 w-4 h-4" />
            ردّ التضعيف (×٤) {redoubled ? '✓' : ''}
          </Button>

          <Button
            size="lg"
            className="w-full h-12"
            disabled={!canAdd}
            onClick={addDoubling}
            data-testid="button-add-doubling"
          >
            <Plus className="ml-2 w-5 h-5" />
            إضافة تضعيف
          </Button>
        </div>
        <DrawerFooter>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="w-full"
            data-testid="button-close-doubling"
          >
            تم
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
