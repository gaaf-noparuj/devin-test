import { useCallback, useEffect, useState } from 'react'
import type { Patient, Stage } from './types'
import { nextStage, previousStage } from './types'

const STORAGE_KEY = 'clinic-flow.patients.v1'
const COUNTERS_KEY = 'clinic-flow.counters.v1'

interface Counters {
  hn: number
  queue: number
}

function load(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Patient[]) : []
  } catch {
    return []
  }
}

function loadCounters(): Counters {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY)
    if (raw) return JSON.parse(raw) as Counters
  } catch {
    // fall through to deriving from stored patients
  }
  const patients = load()
  return {
    hn: patients.reduce((max, p) => Math.max(max, Number(p.hn.match(/\d+$/)?.[0] ?? 0)), 0),
    queue: patients.reduce((max, p) => Math.max(max, p.queueNumber ?? 0), 0),
  }
}

function takeNumber(field: keyof Counters): number {
  const counters = loadCounters()
  const next = counters[field] + 1
  localStorage.setItem(COUNTERS_KEY, JSON.stringify({ ...counters, [field]: next }))
  return next
}

export interface NewPatient {
  hn: string
  name: string
  phone: string
  birthDate: string
  reason: string
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
  }, [patients])

  const register = useCallback((input: NewPatient) => {
    const now = new Date().toISOString()
    const hn = input.hn.trim() || `HN-${String(takeNumber('hn')).padStart(4, '0')}`
    setPatients((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        hn,
        name: input.name.trim(),
        phone: input.phone.trim(),
        birthDate: input.birthDate,
        reason: input.reason.trim(),
        stage: 'registered',
        queueNumber: null,
        amountDue: 0,
        amountPaid: null,
        history: [{ stage: 'registered', at: now }],
      },
    ])
  }, [])

  const advance = useCallback((id: string, payload?: { amountDue?: number; amountPaid?: number }) => {
    let assignedQueueNumber: number | null = null
    setPatients((current) =>
      current.map((patient) => {
        if (patient.id !== id) return patient
        const target = nextStage(patient.stage)
        if (!target) return patient
        return {
          ...patient,
          stage: target,
          queueNumber:
            target === 'in_queue' && patient.queueNumber === null
              ? (assignedQueueNumber ??= takeNumber('queue'))
              : patient.queueNumber,
          amountDue: payload?.amountDue ?? patient.amountDue,
          amountPaid: target === 'checked_out' ? payload?.amountPaid ?? patient.amountDue : patient.amountPaid,
          history: [...patient.history, { stage: target, at: new Date().toISOString() }],
        }
      }),
    )
  }, [])

  const sendBack = useCallback((id: string) => {
    setPatients((current) =>
      current.map((patient) => {
        if (patient.id !== id) return patient
        const target = previousStage(patient.stage)
        if (!target) return patient
        return {
          ...patient,
          stage: target,
          amountPaid: target === 'checked_out' ? patient.amountPaid : null,
          history: [...patient.history, { stage: target, at: new Date().toISOString() }],
        }
      }),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setPatients((current) => current.filter((patient) => patient.id !== id))
  }, [])

  const byStage = useCallback(
    (stage: Stage, query: string) => {
      const q = query.trim().toLowerCase()
      return patients
        .filter((patient) => patient.stage === stage)
        .filter(
          (patient) =>
            !q ||
            patient.name.toLowerCase().includes(q) ||
            patient.hn.toLowerCase().includes(q) ||
            patient.phone.includes(q),
        )
    },
    [patients],
  )

  return { patients, register, advance, sendBack, remove, byStage }
}
