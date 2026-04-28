import React, { useState } from 'react';
import { Player, Doubling, Team, GameMode, Contract } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { DoublingDrawer } from './DoublingDrawer';
import { computeBanatDoublings, computeSheikhDoublings, MULTIPLIERS } from '@/lib/scoring';
import { Zap } from 'lucide-react';

interface SheikhDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  mode: GameMode;
  teams?: Team[];
  onConfirm: (scores: Record<string, number>, doublings: Doubling[], doublingScores: Record<string, number>) => void;
}

export function SheikhDrawer({ open, onOpenChange, players, mode, teams, onConfirm }: SheikhDrawerProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [doublings, setDoublings] = useState<Doubling[]>([]);
  const [doublingOpen, setDoublingOpen] = useState(false);

  const handleConfirm = () => {
    if (!selectedPlayerId) return;
    const scores: Record<string, number> = {};
    players.forEach(p => {
      scores[p.id] = p.id === selectedPlayerId ? MULTIPLIERS.SHEIKH : 0;
    });
    
    const doublingScores = computeSheikhDoublings(scores, doublings);
    onConfirm(scores, doublings, doublingScores);
    onOpenChange(false);
    setSelectedPlayerId(null);
    setDoublings([]);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold font-serif text-primary text-center">الشيخ</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <p className="text-center text-muted-foreground">من أخذ الكبة (الشيخ)؟</p>
          <div className="grid grid-cols-2 gap-3">
            {players.map(p => (
              <Button
                key={p.id}
                variant={selectedPlayerId === p.id ? 'default' : 'outline'}
                className={`h-16 text-lg ${selectedPlayerId === p.id ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setSelectedPlayerId(p.id)}
              >
                {p.name}
              </Button>
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
          <Button size="lg" onClick={handleConfirm} disabled={!selectedPlayerId} className="w-full text-lg">تأكيد (-75)</Button>
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
        contractName="الشيخ" 
      />
    </Drawer>
  );
}
