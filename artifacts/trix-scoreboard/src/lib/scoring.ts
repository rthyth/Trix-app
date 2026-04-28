import { Doubling, Team } from './types';

export const MULTIPLIERS = {
  SHEIKH: -75,
  BANAT: -25,
  DINARI: -10,
  LOTOOSH: -15,
};

export const TRIX_SCORES = [200, 150, 100, 50];

/**
 * SHEIKH scoring (with optional doubling).
 *
 * Rules:
 *  - If NOT doubled: takerId gets -75.
 *  - If doubled (one doubler declared before play):
 *      • Doubler takes the King themselves → doubler gets -150 total
 *        (no one else gets points).
 *      • Anyone else takes it → that taker gets -150, doubler gets +75.
 *
 * The base `scores` map carries the -75 the taker would have lost anyway,
 * and `doublingScores` carries the additional adjustments from doubling.
 * Final per-player score = scores + doublingScores.
 */
export function computeSheikhScores(
  takerId: string,
  doublings: Doubling[],
): { scores: Record<string, number>; doublingScores: Record<string, number> } {
  const scores: Record<string, number> = {};
  const doublingScores: Record<string, number> = {};

  scores[takerId] = MULTIPLIERS.SHEIKH; // -75 base

  if (doublings.length === 0) {
    return { scores, doublingScores };
  }

  const { doublerId } = doublings[0];

  // The taker always pays an extra -75 when doubled (so total = -150).
  doublingScores[takerId] = (doublingScores[takerId] || 0) + MULTIPLIERS.SHEIKH;

  // Bonus to doubler ONLY if someone else took it.
  if (takerId !== doublerId) {
    doublingScores[doublerId] = (doublingScores[doublerId] || 0) - MULTIPLIERS.SHEIKH; // +75
  }

  return { scores, doublingScores };
}

/**
 * BANAT scoring (with per-queen doubling).
 *
 * Rules per queen:
 *  - Base: each queen taken = -25 (so a player who took N queens gets -25*N).
 *  - For each doubled queen (entry in `doublings`):
 *      • Doubler took their own doubled queen → doubler pays an EXTRA -25
 *        (that queen is -50 instead of -25 for them, and no one else benefits).
 *      • Someone else took it → taker pays an EXTRA -25, doubler gets +25.
 */
export function computeBanatScores(
  queenCounts: Record<string, number>,
  doublings: Doubling[],
): { scores: Record<string, number>; doublingScores: Record<string, number> } {
  const scores: Record<string, number> = {};
  const doublingScores: Record<string, number> = {};

  for (const [id, count] of Object.entries(queenCounts)) {
    scores[id] = (count || 0) * MULTIPLIERS.BANAT;
  }

  for (const d of doublings) {
    // The taker pays an extra -25 for that queen (total -50).
    doublingScores[d.takerId] = (doublingScores[d.takerId] || 0) + MULTIPLIERS.BANAT;

    // Doubler bonus only if someone else took it.
    if (d.takerId !== d.doublerId) {
      doublingScores[d.doublerId] = (doublingScores[d.doublerId] || 0) - MULTIPLIERS.BANAT; // +25
    }
  }

  return { scores, doublingScores };
}

/**
 * Aggregate a player's total across all kingdoms (base scores + any doubling
 * adjustments from each contract). Partnership team totals simply sum each
 * teammate's individual total — keeping the per-round per-player accounting
 * clean and unambiguous.
 */
export function getPlayerTotalScore(playerId: string, kingdoms: any[]): number {
  let total = 0;
  for (const k of kingdoms) {
    for (const c of k.completedContracts) {
      total += c.scores?.[playerId] || 0;
      if (c.doublingScores) total += c.doublingScores[playerId] || 0;
    }
  }
  return total;
}

export function getTeamTotalScore(teamId: string, teams: Team[], kingdoms: any[]): number {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return 0;
  return team.playerIds.reduce((sum, pId) => sum + getPlayerTotalScore(pId, kingdoms), 0);
}
