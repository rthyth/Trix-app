import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Users, User, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/lib/game-context';
import { AppHeader } from '@/components/AppHeader';

export default function Setup() {
  const [, setLocation] = useLocation();
  const { dispatch } = useGame();
  
  const [mode, setMode] = useState<'individual' | 'partnership'>('individual');
  const [players, setPlayers] = useState(['', '', '', '']);
  const [team1Name, setTeam1Name] = useState('الفريق الأول');
  const [team2Name, setTeam2Name] = useState('الفريق الثاني');
  
  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };
  
  const isFormValid = players.every(p => p.trim().length > 0) && 
    (mode === 'individual' || (team1Name.trim().length > 0 && team2Name.trim().length > 0));

  const handleStart = () => {
    if (!isFormValid) return;
    
    const playerObjects = players.map((name, i) => ({
      id: `p${i + 1}`,
      name: name.trim(),
      teamId: mode === 'partnership' ? (i < 2 ? 't1' : 't2') as 't1' | 't2' : undefined
    }));
    
    const teams = mode === 'partnership' ? [
      { id: 't1', name: team1Name.trim(), playerIds: ['p1', 'p2'] },
      { id: 't2', name: team2Name.trim(), playerIds: ['p3', 'p4'] }
    ] : undefined;

    dispatch({
      type: 'START_GAME',
      payload: {
        mode,
        players: playerObjects,
        teams
      }
    });
    
    setLocation('/game');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AppHeader title="إعداد اللعبة" showBack backTo="/" />
      
      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <Label className="text-base text-muted-foreground">نوع اللعبة</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  mode === 'individual' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
                onClick={() => setMode('individual')}
              >
                <User className="w-8 h-8 mb-2" />
                <span className="font-bold">فردي</span>
              </button>
              
              <button
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  mode === 'partnership' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                }`}
                onClick={() => setMode('partnership')}
              >
                <Users className="w-8 h-8 mb-2" />
                <span className="font-bold">زوجي</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-base text-muted-foreground">أسماء اللاعبين</Label>
            
            {mode === 'individual' ? (
              <div className="space-y-3">
                {players.map((p, i) => (
                  <Input
                    key={i}
                    placeholder={`اللاعب ${i + 1}`}
                    value={p}
                    onChange={(e) => handlePlayerChange(i, e.target.value)}
                    className="h-12 text-lg bg-card"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <Input
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="h-12 text-lg font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                    placeholder="اسم الفريق الأول"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="اللاعب 1"
                      value={players[0]}
                      onChange={(e) => handlePlayerChange(0, e.target.value)}
                      className="h-12 bg-background"
                    />
                    <Input
                      placeholder="اللاعب 2"
                      value={players[1]}
                      onChange={(e) => handlePlayerChange(1, e.target.value)}
                      className="h-12 bg-background"
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <Input
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="h-12 text-lg font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                    placeholder="اسم الفريق الثاني"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="اللاعب 3"
                      value={players[2]}
                      onChange={(e) => handlePlayerChange(2, e.target.value)}
                      className="h-12 bg-background"
                    />
                    <Input
                      placeholder="اللاعب 4"
                      value={players[3]}
                      onChange={(e) => handlePlayerChange(3, e.target.value)}
                      className="h-12 bg-background"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <div className="p-6 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl" 
          disabled={!isFormValid}
          onClick={handleStart}
        >
          ابدأ اللعبة
          <Play className="mr-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}