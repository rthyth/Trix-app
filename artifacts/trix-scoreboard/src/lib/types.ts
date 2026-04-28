export type GameMode = 'individual' | 'partnership';

export interface Player {
  id: string; // p1, p2, p3, p4
  name: string;
  teamId?: 't1' | 't2';
}

export interface Team {
  id: string; // t1, t2
  name: string;
  playerIds: string[];
}

export enum Contract {
  SHEIKH = 'sheikh',
  BANAT = 'banat',
  DINARI = 'dinari',
  LOTOOSH = 'lotoosh',
  TRIX = 'trix'
}

export interface Doubling {
  fromPlayerId: string; // X doubled Y
  toPlayerId: string;   // Y
  redoubled: boolean;   // if true, multiplier is 4, else 2
}

export interface ContractResult {
  contract: Contract;
  scores: Record<string, number>; // playerId -> normal score
  doublings?: Doubling[];
  doublingScores?: Record<string, number>; // playerId -> doubling adjustments
}

export interface Kingdom {
  kingId: string;
  completedContracts: ContractResult[];
}

export interface GameState {
  id: string;
  startDate: string;
  mode: GameMode;
  players: Player[];
  teams?: Team[];
  kingdoms: Kingdom[]; // Exactly 4 kingdoms
  currentKingdomIndex: number;
  isFinished: boolean;
}

export interface StartGamePayload {
  mode: GameMode;
  players: Player[];
  teams?: Team[];
  firstKingId: string; // playerId who holds the 7 of Hearts and opens the first kingdom
}

export type Action =
  | { type: 'START_GAME'; payload: StartGamePayload }
  | { type: 'APPLY_CONTRACT'; payload: ContractResult }
  | { type: 'ADVANCE_KINGDOM' }
  | { type: 'END_GAME' }
  | { type: 'UNDO' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'QUIT_GAME' };

export interface HistoryEntry {
  id: string;
  date: string;
  mode: GameMode;
  players: Player[];
  teams?: Team[];
  finalScores: Record<string, number>; // playerId or teamId -> score
  winnerId: string; 
  kingdoms: Kingdom[];
}
