export type CheckinStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'INSUFFICIENT_DATA'

export type CheckinConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * GET /api/checkin — this week's adaptive-TDEE proposal. Every number is nullable: the backend
 * sends them all `null` for INSUFFICIENT_DATA, and this Sprint 3a endpoint may not exist at all on
 * a given backend deploy yet (see the feature hooks in `useCheckin.ts`) — every consumer must
 * treat a partially-null payload the same as "nothing to show", never crash on it.
 */
export interface CheckinResponse {
  weekStart: string
  status: CheckinStatus
  windowStart: string
  windowEnd: string
  completeDays: number | null
  weighIns: number | null
  avgIntakeKcal: number | null
  trendChangeKg: number | null
  formulaTdee: number | null
  currentTdee: number | null
  estimatedTdee: number | null
  proposedTdee: number | null
  currentTargetKcal: number | null
  proposedTargetKcal: number | null
  confidence: CheckinConfidence
  reasons: string[]
}

/** One row of GET /api/checkin/history?limit=12 — the slim shape used for the Progreso list/chart. */
export interface CheckinHistoryEntry {
  weekStart: string
  status: CheckinStatus
  estimatedTdee: number | null
  appliedTdee: number | null
  avgIntakeKcal: number | null
  trendChangeKg: number | null
}
