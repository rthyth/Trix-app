import React, { useState } from 'react';
import { Player, Team, GameMode, Doubling } from '@/lib/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export function DoublingDrawer({ open, onOpenChange, players, teams, mode, doublings, onChange, contractName }: DoublingDrawerProps) {
  // Generate possible pairs
  const pairs: { from: Player, to: Player }[] = [];
  
  if (mode === 'individual') {
    for (let i = 0; i < players.length; i++) {
      for (let j = 0; j < players.length; j++) {
        if (i !== j) {
          pairs.push({ from: players[i], to: players[j] });
        }
      }
    }
  } else if (teams) {
    const t1 = players.filter(p => p.teamId === 't1');
    const t2 = players.filter(p => p.teamId === 't2');
    
    t1.forEach(p1 => {
      t2.forEach(p2 => {
        pairs.push({ from: p1, to: p2 });
        pairs.push({ from: p2, to: p1 });
      });
    });
  }

  const toggleDoubling = (fromId: string, toId: string, checked: boolean) => {
    if (checked) {
      onChange([...doublings, { fromPlayerId: fromId, toPlayerId: toId, redoubled: false }]);
    } else {
      onChange(doublings.filter(d => !(d.fromPlayerId === fromId && d.toPlayerId === toId)));
    }
  };

  const toggleRedoubling = (fromId: string, toId: string, checked: boolean) => {
    onChange(doublings.map(d => {
      if (d.fromPlayerId === fromId && d.toPlayerId === toId) {
        return { ...d, redoubled: checked };
      }
      return d;
    }));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl font-bold font-serif text-primary">تضعيف - {contractName}</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="p-4 overflow-y-auto h-[50vh]">
          <div className="space-y-4">
            {pairs.map(pair => {
              const d = doublings.find(x => x.fromPlayerId === pair.from.id && x.toPlayerId === pair.to.id);
              const isActive = !!d;
              return (
                <div key={`${pair.from.id}-${pair.to.id}`} className="p-4 bg-card border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg cursor-pointer flex items-center gap-2">
                      <Checkbox 
                        checked={isActive} 
                        onCheckedChange={(c) => toggleDoubling(pair.from.id, pair.to.id, !!c)} 
                        className="w-6 h-6"
                      />
                      <span>{pair.from.name} <span className="text-muted-foreground text-sm">يضعّف</span> {pair.to.name}</span>
                    </Label>
                  </div>
                  {isActive && (
                    <div className="pl-8 flex items-center gap-2">
                      <Checkbox 
                        checked={d.redoubled} 
                        onCheckedChange={(c) => toggleRedoubling(pair.from.id, pair.to.id, !!c)} 
                        className="w-5 h-5 text-destructive"
                      />
                      <Label className="text-sm text-destructive cursor-pointer">ردّ التضعيف (x4)</Label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <DrawerFooter>
          <Button onClick={() => onOpenChange(false)} size="lg" className="w-full text-lg">تأكيد</Button>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full text-lg">إلغاء</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
