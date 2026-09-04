export const STAGES = [
  'registered',
  'checked_in',
  'in_queue',
  'waiting_payment',
  'checked_out',
] as const

export type Stage = (typeof STAGES)[number]

export const STAGE_LABELS: Record<Stage, string> = {
  registered: 'Registered',
  checked_in: 'Checked in',
  in_queue: 'In queue',
  waiting_payment: 'Waiting for payment',
  checked_out: 'Checked out',
}

export const NEXT_ACTION_LABELS: Record<Stage, string | null> = {
  registered: 'Check in',
  checked_in: 'Send to queue',
  in_queue: 'Finish visit',
  waiting_payment: 'Take payment & check out',
  checked_out: null,
}

export interface Patient {
  id: string
  hn: string
  name: string
  phone: string
  birthDate: string
  reason: string
  stage: Stage
  queueNumber: number | null
  amountDue: number
  amountPaid: number | null
  history: { stage: Stage; at: string }[]
}

export function nextStage(stage: Stage): Stage | null {
  const i = STAGES.indexOf(stage)
  return i < STAGES.length - 1 ? STAGES[i + 1] : null
}

export function previousStage(stage: Stage): Stage | null {
  const i = STAGES.indexOf(stage)
  return i > 0 ? STAGES[i - 1] : null
}

export function enteredStageAt(patient: Patient, stage: Stage): string | null {
  const entry = [...patient.history].reverse().find((h) => h.stage === stage)
  return entry ? entry.at : null
}
