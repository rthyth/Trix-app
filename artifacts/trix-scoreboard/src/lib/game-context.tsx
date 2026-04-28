import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { ContractResult, GameMode, GameState, Player, Team, Contract, Kingdom } from './types';
import { loadCurrentGame, saveCurrentGame, addGameToHistory } from './storage';
import { getPlayerTotalScore, getTeamTotalScore } from './scoring';

interface GameContextState {
  current: GameState | null;
  past: GameState[];
}

type Action =
  | { type: 'START_GAME'; payload: Omit<GameState, 'id' | 'startDate' | 'kingdoms' | 'currentKingdomIndex' | 'isFinished'> }
  | { type: 'APPLY_CONTRACT'; payload: ContractResult }
  | { type: 'ADVANCE_KINGDOM' }
  | { type: 'END_GAME' }
  | { type: 'UNDO' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'QUIT_GAME' };

const generateId = () => Math.random().toString(36).substr(2, 9);

function initKingdoms(players: Player[]): Kingdom[] {
  return players.map(p => ({
    kingId: p.id,
    completedContracts: [],
  }));
}

function gameReducer(state: GameContextState, action: Action): GameContextState {
  switch (action.type) {
    case 'START_GAME': {
      const newGame: GameState = {
        ...action.payload,
        id: generateId(),
        startDate: new Date().toISOString(),
        kingdoms: initKingdoms(action.payload.players),
        currentKingdomIndex: 0,
        isFinished: false,
      };
      return { current: newGame, past: [] };
    }
    case 'LOAD_GAME':
      return { current: action.payload, past: [] };
    case 'QUIT_GAME':
      return { current: null, past: [] };
    case 'APPLY_CONTRACT': {
      if (!state.current) return state;
      const newState = structuredClone(state.current);
      const kingdom = newState.kingdoms[newState.currentKingdomIndex];
      kingdom.completedContracts.push(action.payload);
      
      // check if kingdom is done
      if (kingdom.completedContracts.length === 5) {
        if (newState.currentKingdomIndex === 3) {
          newState.isFinished = true;
        } else {
          newState.currentKingdomIndex++;
        }
      }
      
      return { current: newState, past: [...state.past, state.current] };
    }
    case 'ADVANCE_KINGDOM': {
      if (!state.current) return state;
      const newState = structuredClone(state.current);
      if (newState.currentKingdomIndex < 3) {
        newState.currentKingdomIndex++;
      } else {
        newState.isFinished = true;
      }
      return { current: newState, past: [...state.past, state.current] };
    }
    case 'END_GAME': {
      if (!state.current) return state;
      const newState = { ...state.current, isFinished: true };
      return { current: newState, past: [...state.past, state.current] };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return { current: previous, past: newPast };
    }
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameContextState;
  dispatch: React.Dispatch<Action>;
  endAndSaveGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, { current: null, past: [] });

  // Initialize from local storage on mount
  useEffect(() => {
    const saved = loadCurrentGame();
    if (saved) {
      dispatch({ type: 'LOAD_GAME', payload: saved });
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (state.current) {
      saveCurrentGame(state.current);
    } else {
      saveCurrentGame(null);
    }
  }, [state.current]);

  const endAndSaveGame = () => {
    if (!state.current) return;
    const finalScores: Record<string, number> = {};
    let winnerId = '';
    let maxScore = -Infinity;

    if (state.current.mode === 'individual') {
      state.current.players.forEach(p => {
        const score = getPlayerTotalScore(p.id, state.current!.kingdoms);
        finalScores[p.id] = score;
        if (score > maxScore) {
          maxScore = score;
          winnerId = p.id;
        }
      });
    } else {
      state.current.teams?.forEach(t => {
        const score = getTeamTotalScore(t.id, state.current!.teams!, state.current!.kingdoms);
        finalScores[t.id] = score;
        if (score > maxScore) {
          maxScore = score;
          winnerId = t.id;
        }
      });
    }

    addGameToHistory(state.current, winnerId, finalScores);
    dispatch({ type: 'QUIT_GAME' });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, endAndSaveGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
