import React, { useState } from 'react';
import { useGame } from '@/lib/game-context';
import { AppHeader } from '@/components/AppHeader';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Crown, Heart, Diamond, Layers, Check } from 'lucide-react';
import { getPlayerTotalScore, getTeamTotalScore } from '@/lib/scoring';
import { Contract, type Doubling } from '@/lib/types';
import { SheikhDrawer } from '@/components/dialogs/SheikhDrawer';
import { BanatDrawer } from '@/components/dialogs/BanatDrawer';
import { CountDrawer } from '@/components/dialogs/CountDrawer';
import { TrixDrawer } from '@/components/dialogs/TrixDrawer';
import { MULTIPLIERS } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

export default function Game() {
  const { state, dispatch, endAndSaveGame } = useGame();
  const [, setLocation] = useLocation();
  
  const [activeDialog, setActiveDialog] = useState<Contract | null>(null);
  
  if (!state.current) {
    setLocation('/');
    return null;
  }
  
  const game = state.current;
  const currentKingdom = game.kingdoms[game.currentKingdomIndex];
  
  if (game.isFinished) {
    endAndSaveGame();
    setLocation('/results');
    return null;
  }
  
  const currentKing = game.players.find(p => p.id === currentKingdom.kingId);
  
  const completedContracts = currentKingdom.completedContracts.map(c => c.contract);
  
  const applyContract = (
    contract: Contract,
    scores: Record<string, number>,
    doublings: Doubling[] = [],
    doublingScores: Record<string, number> = {},
  ) => {
    dispatch({
      type: 'APPLY_CONTRACT',
      payload: { contract, scores, doublings, doublingScores },
    });
  };

  const getContractIcon = (c: Contract) => {
    switch (c) {
      case Contract.SHEIKH: return <Crown className="w-8 h-8" />;
      case Contract.BANAT: return <Heart className="w-8 h-8" />;
      case Contract.DINARI: return <Diamond className="w-8 h-8" />;
      case Contract.LOTOOSH: return <Layers className="w-8 h-8" />;
      case Contract.TRIX: return <Trophy className="w-8 h-8" />;
    }
  };

  const getContractName = (c: Contract) => {
    switch (c) {
      case Contract.SHEIKH: return 'الشيخ';
      case Contract.BANAT: return 'البنات';
      case Contract.DINARI: return 'الديناري';
      case Contract.LOTOOSH: return 'اللطوش';
      case Contract.TRIX: return 'التركس';
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AppHeader 
        title={`المملكة ${game.currentKingdomIndex + 1} من 4`} 
        rightElement={
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.past.length === 0}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm('هل أنت متأكد من إنهاء اللعبة؟')) {
                  endAndSaveGame();
                  setLocation('/results');
                }
              }}
            >
              إنهاء
            </Button>
          </div>
        }
      />
      
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col gap-6">
        <div className="text-center p-6 bg-card rounded-2xl border-2 border-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">صاحب المملكة</p>
          <h2 className="text-3xl font-bold text-primary font-serif">{currentKing?.name}</h2>
        </div>
        
        {/* Standings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground px-1">النتائج</h3>
          <div className="grid grid-cols-2 gap-3">
            {game.mode === 'individual' ? (
              game.players.map(p => {
                const score = getPlayerTotalScore(p.id, game.kingdoms);
                return (
                  <div key={p.id} className="p-4 bg-card rounded-xl border border-border flex flex-col items-center shadow-sm">
                    <span className="text-sm font-medium text-muted-foreground mb-1">{p.name}</span>
                    <AnimatePresence mode="popLayout">
                      <motion.span 
                        key={score}
                        initial={{ scale: 1.2, color: 'var(--primary)' }}
                        animate={{ scale: 1, color: score >= 0 ? 'var(--primary)' : 'var(--destructive)' }}
                        className="text-3xl font-bold"
                      >
                        {score}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              game.teams?.map(t => {
                const score = getTeamTotalScore(t.id, game.teams!, game.kingdoms);
                return (
                  <div key={t.id} className="p-4 bg-card rounded-xl border border-border flex flex-col items-center shadow-sm">
                    <span className="text-sm font-medium text-muted-foreground mb-1">{t.name}</span>
                    <AnimatePresence mode="popLayout">
                      <motion.span 
                        key={score}
                        initial={{ scale: 1.2, color: 'var(--primary)' }}
                        animate={{ scale: 1, color: score >= 0 ? 'var(--primary)' : 'var(--destructive)' }}
                        className="text-3xl font-bold"
                      >
                        {score}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Contracts Grid */}
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-bold text-muted-foreground px-1">الكونترات</h3>
          <div className="grid grid-cols-2 gap-3">
             {Object.values(Contract).map(c => {
               const isCompleted = completedContracts.includes(c);
               return (
                 <Button
                   key={c}
                   variant={isCompleted ? 'secondary' : 'outline'}
                   className={`h-24 flex flex-col gap-2 rounded-2xl border-2 transition-all ${isCompleted ? 'opacity-50 grayscale bg-muted/50 border-transparent' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                   disabled={isCompleted}
                   onClick={() => setActiveDialog(c)}
                 >
                   {isCompleted ? <Check className="w-8 h-8 text-muted-foreground" /> : getContractIcon(c)}
                   <span className="font-bold text-lg">{getContractName(c)}</span>
                 </Button>
               );
             })}
          </div>
        </div>
        
      </main>

      <SheikhDrawer 
        open={activeDialog === Contract.SHEIKH} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
        players={game.players}
        mode={game.mode}
        teams={game.teams}
        onConfirm={(s, d, ds) => applyContract(Contract.SHEIKH, s, d, ds)}
      />
      
      <BanatDrawer 
        open={activeDialog === Contract.BANAT} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
        players={game.players}
        mode={game.mode}
        teams={game.teams}
        onConfirm={(s, d, ds) => applyContract(Contract.BANAT, s, d, ds)}
      />

      <CountDrawer 
        open={activeDialog === Contract.DINARI} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
        players={game.players}
        title="الديناري"
        totalRequired={13}
        multiplier={MULTIPLIERS.DINARI}
        onConfirm={(s) => applyContract(Contract.DINARI, s)}
      />

      <CountDrawer 
        open={activeDialog === Contract.LOTOOSH} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
        players={game.players}
        title="اللطوش"
        totalRequired={13}
        multiplier={MULTIPLIERS.LOTOOSH}
        onConfirm={(s) => applyContract(Contract.LOTOOSH, s)}
      />

      <TrixDrawer 
        open={activeDialog === Contract.TRIX} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
        players={game.players}
        onConfirm={(s) => applyContract(Contract.TRIX, s)}
      />
    </div>
  );
}