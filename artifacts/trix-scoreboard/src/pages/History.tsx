import { useEffect, useState } from 'react';
import { loadHistory, deleteHistoryEntry, clearHistory } from '@/lib/storage';
import type { HistoryEntry } from '@/lib/types';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory().reverse());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه اللعبة؟')) {
      deleteHistoryEntry(id);
      setHistory(loadHistory().reverse());
    }
  };

  const handleClear = () => {
    if (confirm('هل أنت متأكد من مسح السجل بالكامل؟')) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <AppHeader title="السجل" showBack backTo="/" />
      
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="text-lg">لا يوجد ألعاب سابقة</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button variant="destructive" size="sm" onClick={handleClear}>
                <Trash2 className="mr-2 w-4 h-4" />
                مسح السجل بالكامل
              </Button>
            </div>
            
            {history.map(game => (
              <div key={game.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div 
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === game.id ? null : game.id)}
                >
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {format(new Date(game.date), 'dd MMMM yyyy - p', { locale: ar })}
                    </div>
                    <div className="font-bold text-lg">
                      {game.mode === 'individual' ? 'فردي' : 'زوجي'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold">الفائز: {
                      game.mode === 'individual' 
                        ? game.players.find(p => p.id === game.winnerId)?.name 
                        : game.teams?.find(t => t.id === game.winnerId)?.name
                    }</span>
                    {expandedId === game.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>
                
                {expandedId === game.id && (
                  <div className="p-4 bg-muted/10 border-t border-border space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {game.mode === 'individual' ? (
                        game.players.map(p => (
                          <div key={p.id} className="p-2 bg-background border rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className="font-bold">{game.finalScores[p.id]}</span>
                          </div>
                        ))
                      ) : (
                        game.teams?.map(t => (
                          <div key={t.id} className="p-2 bg-background border rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium">{t.name}</span>
                            <span className="font-bold">{game.finalScores[t.id]}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}>
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}