import React from 'react';
import { Link, useLocation } from 'wouter';
import { Play, History as HistoryIcon, Swords, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/game-context';
import { motion } from 'framer-motion';

export default function Home() {
  const { state } = useGame();
  const [, setLocation] = useLocation();

  const hasActiveGame = !!state.current;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center z-10 w-full max-w-md"
      >
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-2xl bg-card border-2 border-primary/50 shadow-xl shadow-primary/10 flex items-center justify-center transform rotate-3">
            <Swords className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full -z-10" />
        </div>
        
        <h1 className="text-5xl font-extrabold font-serif mb-2 text-foreground tracking-tight">
          تركس
        </h1>
        <p className="text-muted-foreground mb-12 font-medium tracking-widest uppercase text-sm">
          سجل النقاط الرسمي
        </p>

        <div className="flex flex-col gap-4 w-full">
          {hasActiveGame ? (
            <Button 
              size="lg" 
              className="w-full h-16 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
              onClick={() => setLocation('/game')}
              data-testid="button-continue-game"
            >
              <RotateCcw className="ml-2 w-5 h-5" />
              متابعة اللعبة
            </Button>
          ) : null}

          <Button 
            size="lg" 
            variant={hasActiveGame ? "outline" : "default"}
            className={`w-full h-16 text-lg rounded-xl ${!hasActiveGame ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20' : 'border-primary/30 hover:bg-primary/10'}`}
            onClick={() => setLocation('/setup')}
            data-testid="button-new-game"
          >
            <Play className="ml-2 w-5 h-5" />
            لعبة جديدة
          </Button>

          <Button 
            size="lg" 
            variant="ghost"
            className="w-full h-16 text-lg rounded-xl hover:bg-muted/50"
            onClick={() => setLocation('/history')}
            data-testid="button-history"
          >
            <HistoryIcon className="ml-2 w-5 h-5" />
            السجل
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
