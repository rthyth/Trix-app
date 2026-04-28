import React, { useState } from 'react';
import { Player } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MULTIPLIERS } from '@/lib/scoring';
import { Plus, Minus } from 'lucide-react';

interface CountDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  title: string;
  totalRequired: number;
  multiplier: number;
  onConfirm: (scores: Record<string, number>) => void;
}

export function CountDrawer({ open, onOpenChange, players, title, totalRequired, multiplier, onConfirm }: CountDrawerProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isValid = total === totalRequired;

  const updateCount = (id: string, delta: number) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0 || next > totalRequired) return prev;
      if (total + delta > totalRequired) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const scores: Record<string, number> = {};
    players.forEach(p => {
      scores[p.id] = (counts[p.id] || 0) * multiplier;
    });
    
    onConfirm(scores);
    onOpenChange(false);
    setCounts({});
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <div className="text-center">
            <span className={`text-xl font-bold ${isValid ? 'text-primary' : 'text-muted-foreground'}`}>{total} / {totalRequired}</span>
          </div>
          
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-card border rounded-xl">
                <span className="font-bold text-lg">{p.name}</span>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => updateCount(p.id, 1)} disabled={total >= totalRequired}>
                    <Plus className="w-6 h-6" />
                  </Button>
                  <span className="text-2xl font-bold w-8 text-center">{counts[p.id] || 0}</span>
                  <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => updateCount(p.id, -1)} disabled={!counts[p.id]}>
                    <Minus className="w-6 h-6" />
                  </Button>
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
