import { ContractResult, Doubling, GameMode, Player, Team } from './types';

export const MULTIPLIERS = {
  SHEIKH: -75,
  BANAT: -25,
  DINARI: -10,
  LOTOOSH: -15,
};

export const TRIX_SCORES = [200, 150, 100, 50];

export function computeSheikhDoublings(
  scores: Record<string, number>, // base scores (contains -75 for someone)
  doublings: Doubling[]
): Record<string, number> {
  const adjustments: Record<string, number> = {};
  
  for (const d of doublings) {
    const multiplier = d.redoubled ? 4 : 2;
    const yGotSheikh = scores[d.toPlayerId] === MULTIPLIERS.SHEIKH;
    
    // If Y got sheikh, Y loses 75*M, X gains 75*M
    // If Y didn't get sheikh, X loses 75*M, Y gains 75*M
    const amount = 75 * multiplier;
    
    if (!adjustments[d.fromPlayerId]) adjustments[d.fromPlayerId] = 0;
    if (!adjustments[d.toPlayerId]) adjustments[d.toPlayerId] = 0;
    
    if (yGotSheikh) {
      adjustments[d.toPlayerId] -= amount;
      adjustments[d.fromPlayerId] += amount;
    } else {
      adjustments[d.fromPlayerId] -= amount;
      adjustments[d.toPlayerId] += amount;
    }
  }
  
  return adjustments;
}

export function computeBanatDoublings(
  banatCounts: Record<string, number>, // playerId -> number of queens
  doublings: Doubling[]
): Record<string, number> {
  const adjustments: Record<string, number> = {};
  
  for (const d of doublings) {
    const multiplier = d.redoubled ? 4 : 2;
    const yQueens = banatCounts[d.toPlayerId] || 0;
    const xQueens = banatCounts[d.fromPlayerId] || 0;
    
    // Y pays X for the difference
    const diff = yQueens - xQueens;
    if (diff === 0) continue;
    
    const amount = diff * 25 * multiplier;
    
    if (!adjustments[d.fromPlayerId]) adjustments[d.fromPlayerId] = 0;
    if (!adjustments[d.toPlayerId]) adjustments[d.toPlayerId] = 0;
    
    adjustments[d.toPlayerId] -= amount;
    adjustments[d.fromPlayerId] += amount;
  }
  
  return adjustments;
}

export function getPlayerTotalScore(playerId: string, kingdoms: any[]): number {
  let total = 0;
  for (const k of kingdoms) {
    for (const c of k.completedContracts) {
      total += (c.scores[playerId] || 0);
      if (c.doublingScores) {
        total += (c.doublingScores[playerId] || 0);
      }
    }
  }
  return total;
}

export function getTeamTotalScore(teamId: string, teams: Team[], kingdoms: any[]): number {
  const team = teams.find(t => t.id === teamId);
  if (!team) return 0;
  return team.playerIds.reduce((sum, pId) => sum + getPlayerTotalScore(pId, kingdoms), 0);
}
