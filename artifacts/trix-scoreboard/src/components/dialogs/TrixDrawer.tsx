import React, { useState } from 'react';
import { Player } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { TRIX_SCORES } from '@/lib/scoring';

interface TrixDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onConfirm: (scores: Record<string, number>) => void;
}

export function TrixDrawer({ open, onOpenChange, players, onConfirm }: TrixDrawerProps) {
  const [ranks, setRanks] = useState<Record<string, number>>({});

  const isRankUsed = (rank: number) => Object.values(ranks).includes(rank);
  const isValid = Object.keys(ranks).length === 4;

  const toggleRank = (playerId: string, rank: number) => {
    if (ranks[playerId] === rank) {
      const newRanks = { ...ranks };
      delete newRanks[playerId];
      setRanks(newRanks);
    } else if (!isRankUsed(rank)) {
      setRanks({ ...ranks, [playerId]: rank });
    }
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const scores: Record<string, number> = {};
    players.forEach(p => {
      const rank = ranks[p.id];
      scores[p.id] = TRIX_SCORES[rank - 1]; // rank is 1-4, array is 0-3
    });
    
    onConfirm(scores);
    onOpenChange(false);
    setRanks({});
  };

  const rankLabels = ['الأول (+200)', 'الثاني (+150)', 'الثالث (+100)', 'الرابع (+50)'];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center">التركس</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            {players.map(p => (
              <div key={p.id} className="p-3 bg-card border rounded-xl space-y-3">
                <span className="font-bold text-lg">{p.name}</span>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(rank => {
                    const selected = ranks[p.id] === rank;
                    const disabled = !selected && isRankUsed(rank);
                    return (
                      <Button
                        key={rank}
                        variant={selected ? 'default' : 'outline'}
                        className={`h-12 text-sm font-bold ${selected ? 'bg-primary text-primary-foreground' : ''}`}
                        disabled={disabled}
                        onClick={() => toggleRank(p.id, rank)}
                      >
                        {rank}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleConfirm} disabled={!isValid} className="w-full text-lg">تأكيد</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
