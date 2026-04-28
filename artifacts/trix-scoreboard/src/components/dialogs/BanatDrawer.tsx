import React, { useState } from 'react';
import { Player, Doubling, Team, GameMode } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { DoublingDrawer } from './DoublingDrawer';
import { computeBanatDoublings, MULTIPLIERS } from '@/lib/scoring';
import { Zap, Plus, Minus } from 'lucide-react';

interface BanatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  mode: GameMode;
  teams?: Team[];
  onConfirm: (scores: Record<string, number>, doublings: Doubling[], doublingScores: Record<string, number>) => void;
}

export function BanatDrawer({ open, onOpenChange, players, mode, teams, onConfirm }: BanatDrawerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [doublings, setDoublings] = useState<Doubling[]>([]);
  const [doublingOpen, setDoublingOpen] = useState(false);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isValid = total === 4;

  const updateCount = (id: string, delta: number) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > 4) return prev;
      if (total + delta > 4) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const scores: Record<string, number> = {};
    players.forEach(p => {
      scores[p.id] = (counts[p.id] || 0) * MULTIPLIERS.BANAT;
    });
    
    const doublingScores = computeBanatDoublings(counts, doublings);
    onConfirm(scores, doublings, doublingScores);
    onOpenChange(false);
    setCounts({});
    setDoublings([]);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center">البنات</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <div className="text-center">
            <span className={`text-xl font-bold ${isValid ? 'text-primary' : 'text-muted-foreground'}`}>{total} / 4</span>
          </div>
          
          <div className="space-y-4">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-card border rounded-xl">
                <span className="font-bold text-lg">{p.name}</span>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => updateCount(p.id, 1)} disabled={total >= 4}>
                    <Plus className="w-6 h-6" />
                  </Button>
                  <span className="text-2xl font-bold w-6 text-center">{counts[p.id] || 0}</span>
                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => updateCount(p.id, -1)} disabled={!counts[p.id]}>
                    <Minus className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="secondary" 
            className="w-full h-12 text-base font-bold bg-secondary/50 text-secondary-foreground"
            onClick={() => setDoublingOpen(true)}
          >
            <Zap className="mr-2 w-4 h-4 text-primary" />
            التضعيف {doublings.length > 0 ? `(${doublings.length})` : ''}
          </Button>
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleConfirm} disabled={!isValid} className="w-full text-lg">تأكيد</Button>
        </DrawerFooter>
      </DrawerContent>
      <DoublingDrawer 
        open={doublingOpen} 
        onOpenChange={setDoublingOpen} 
        players={players} 
        teams={teams} 
        mode={mode} 
        doublings={doublings} 
        onChange={setDoublings} 
        contractName="البنات" 
      />
    </Drawer>
  );
}
