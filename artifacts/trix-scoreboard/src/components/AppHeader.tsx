import React from 'react';
import { Link } from 'wouter';
import { Play, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightElement?: React.ReactNode;
}

export function AppHeader({ title, showBack, backTo = '/', rightElement }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link href={backTo}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0 rounded-full">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <h1 className="text-xl font-bold font-serif tracking-wide text-foreground">
          {title}
        </h1>
      </div>
      <div>{rightElement}</div>
    </header>
  );
}
