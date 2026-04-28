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

// A doubling = "the holder of a card declares it doubled before play".
// - For SHEIKH: doublerId = the player who held the King and chose to double.
//   takerId = the player who ended up taking the King.
//   At most ONE doubling per Sheikh round.
// - For BANAT: each entry represents ONE specific doubled queen.
//   doublerId = the player who held that queen and doubled it.
//   takerId = the player who ended up taking that queen.
//   Up to FOUR doublings per Banat round (one per queen).
export interface Doubling {
  doublerId: string;
  takerId: string;
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
