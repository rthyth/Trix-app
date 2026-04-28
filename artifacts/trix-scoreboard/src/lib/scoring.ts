import { ContractResult, Doubling, GameMode, Player, Team } from './types';

export const MULTIPLIERS = {
  SHEIKH: -75,
  BANAT: -25,
  DINARI: -10,
  LOTOOSH: -15,
};

export const TRIX_SCORES = [200, 150, 100, 50];

export function computeSheikhDoublings(
  scores: Record<string, number>, // base scores (contains -75 for the king-taker)
  doublings: Doubling[],
): Record<string, number> {
  const adjustments: Record<string, number> = {};

  for (const d of doublings) {
    const multiplier = d.redoubled ? 4 : 2;
    const amount = 75 * multiplier;

    // X = the doubler (fromPlayerId): bets that Y will take the king.
    // Y = the doubled-on player (toPlayerId).
    // The doubler MAY end up taking the king themselves — in that case X
    // loses the bet just like any other "Y didn't take it" case.
    const yGotSheikh = scores[d.toPlayerId] === MULTIPLIERS.SHEIKH;

    if (!adjustments[d.fromPlayerId]) adjustments[d.fromPlayerId] = 0;
    if (!adjustments[d.toPlayerId]) adjustments[d.toPlayerId] = 0;

    if (yGotSheikh) {
      // X was right: Y took it → Y pays X (on top of the base -75 Y already lost)
      adjustments[d.toPlayerId] -= amount;
      adjustments[d.fromPlayerId] += amount;
    } else {
      // Y avoided it (whether X or a third player took it) → X pays Y.
      // If X took it themselves, X already lost the base -75 AND now also pays Y.
      adjustments[d.fromPlayerId] -= amount;
      adjustments[d.toPlayerId] += amount;
    }
  }

  return adjustments;
}

export function computeBanatDoublings(
  banatCounts: Record<string, number>, // playerId -> number of queens (0..4)
  doublings: Doubling[],
): Record<string, number> {
  const adjustments: Record<string, number> = {};

  for (const d of doublings) {
    const multiplier = d.redoubled ? 4 : 2;

    // X = doubler, Y = doubled-on player. Either side may end up taking
    // queens, including X themselves. The settlement is on the *difference*
    // in queens taken, doubled by the multiplier — so when X took more
    // queens than Y, the diff goes negative and X pays Y instead.
    const yQueens = banatCounts[d.toPlayerId] || 0;
    const xQueens = banatCounts[d.fromPlayerId] || 0;
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
