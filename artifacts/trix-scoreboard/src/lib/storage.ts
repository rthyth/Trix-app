import { GameState, HistoryEntry } from './types';

const GAME_STATE_KEY = 'trix-scoreboard-v1-current';
const HISTORY_KEY = 'trix-scoreboard-v1-history';

export function saveCurrentGame(state: GameState | null) {
  if (!state) {
    localStorage.removeItem(GAME_STATE_KEY);
    return;
  }
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function loadCurrentGame(): GameState | null {
  const data = localStorage.getItem(GAME_STATE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function loadHistory(): HistoryEntry[] {
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addGameToHistory(game: GameState, winnerId: string, finalScores: Record<string, number>) {
  const history = loadHistory();
  const entry: HistoryEntry = {
    id: game.id,
    date: game.startDate,
    mode: game.mode,
    players: game.players,
    teams: game.teams,
    kingdoms: game.kingdoms,
    winnerId,
    finalScores,
  };
  history.push(entry);
  saveHistory(history);
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryEntry(id: string) {
  const history = loadHistory();
  saveHistory(history.filter(h => h.id !== id));
}
