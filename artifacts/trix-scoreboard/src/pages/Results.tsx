import React, { useEffect, useState } from 'react';
import { loadHistory } from '@/lib/storage';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Crown, Play, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Results() {
  const [history] = useState(() => loadHistory());
  const [, setLocation] = useLocation();

  const lastGame = history[history.length - 1];

  if (!lastGame) {
    setLocation('/');
    return null;
  }

  // Sort scores
  const entities = lastGame.mode === 'individual' ? lastGame.players : lastGame.teams!;
  const sorted = [...entities].map(e => ({
    name: e.name,
    score: lastGame.finalScores[e.id] || 0
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      <main className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col items-center justify-center gap-8 relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="text-center relative w-full"
        >
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{ 
                scale: [0, Math.random() * 1.5 + 0.5, 0],
                x: (Math.random() - 0.5) * 300, 
                y: (Math.random() - 0.5) * 300,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
              style={{ backgroundColor: i % 2 === 0 ? '#C9A961' : i % 3 === 0 ? '#F2D780' : '#ffffff' }}
            />
          ))}
          
          <div className="w-32 h-32 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
            <Crown className="w-16 h-16 text-primary absolute z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50"
            />
          </div>
          <h1 className="text-4xl font-bold font-serif text-primary mb-2">النهاية!</h1>
          <p className="text-muted-foreground">الفائز هو</p>
          <h2 className="text-3xl font-bold mt-2 text-foreground">{sorted[0].name}</h2>
        </motion.div>

        <div className="w-full space-y-3">
          {sorted.map((item, i) => (
            <motion.div 
              key={item.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                i === 0 ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(201,169,97,0.2)]' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-bold text-xl w-6 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
                <span className="font-bold text-lg text-foreground">{item.name}</span>
              </div>
              <span className={`text-2xl font-bold ${item.score >= 0 ? 'text-primary' : 'text-destructive'}`}>{item.score}</span>
            </motion.div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3 mt-8">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-xl text-primary-foreground"
            onClick={() => setLocation('/setup')}
          >
            <Play className="ml-2 w-5 h-5" />
            لعبة جديدة
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full h-14 text-lg rounded-xl"
            onClick={() => setLocation('/')}
          >
            <Home className="ml-2 w-5 h-5" />
            العودة للرئيسية
          </Button>
        </div>
      </main>
    </div>
  );
}