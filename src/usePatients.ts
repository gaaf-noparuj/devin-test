import { useCallback, useEffect, useState } from 'react'
import type { Patient, Stage } from './types'
import { nextStage, previousStage } from './types'

const STORAGE_KEY = 'clinic-flow.patients.v1'

function load(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Patient[]) : []
  } catch {
    return []
  }
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
    setPatients((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        hn: input.hn.trim() || `HN-${String(current.length + 1).padStart(4, '0')}`,
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
    setPatients((current) => {
      const nextQueueNumber =
        current.reduce((max, p) => Math.max(max, p.queueNumber ?? 0), 0) + 1
      return current.map((patient) => {
        if (patient.id !== id) return patient
        const target = nextStage(patient.stage)
        if (!target) return patient
        return {
          ...patient,
          stage: target,
          queueNumber: target === 'in_queue' ? nextQueueNumber : patient.queueNumber,
          amountDue: payload?.amountDue ?? patient.amountDue,
          amountPaid: target === 'checked_out' ? payload?.amountPaid ?? patient.amountDue : patient.amountPaid,
          history: [...patient.history, { stage: target, at: new Date().toISOString() }],
        }
      })
    })
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
