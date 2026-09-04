import { useState } from 'react'
import type { Patient } from '../types'
import { NEXT_ACTION_LABELS, STAGE_LABELS, enteredStageAt, previousStage } from '../types'

function timeIn(patient: Patient) {
  const at = enteredStageAt(patient, patient.stage)
  if (!at) return ''
  const minutes = Math.floor((Date.now() - new Date(at).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

interface Props {
  patient: Patient
  onAdvance: (id: string, payload?: { amountDue?: number; amountPaid?: number }) => void
  onSendBack: (id: string) => void
  onRemove: (id: string) => void
}

export function PatientCard({ patient, onAdvance, onSendBack, onRemove }: Props) {
  const [amount, setAmount] = useState('')
  const actionLabel = NEXT_ACTION_LABELS[patient.stage]
  const needsAmount = patient.stage === 'in_queue'
  const isPaymentStep = patient.stage === 'waiting_payment'

  return (
    <article className="card">
      <div className="card-head">
        <span className="card-name">{patient.name}</span>
        {patient.queueNumber !== null && <span className="queue">#{patient.queueNumber}</span>}
      </div>
      <div className="card-meta">
        <span>{patient.hn}</span>
        {patient.phone && <span>{patient.phone}</span>}
      </div>
      {patient.reason && <p className="card-reason">{patient.reason}</p>}

      <div className="card-meta">
        <span>
          {STAGE_LABELS[patient.stage]} · {timeIn(patient)}
        </span>
        {patient.stage === 'waiting_payment' && <span>Due {patient.amountDue.toLocaleString()}</span>}
        {patient.stage === 'checked_out' && (
          <span>Paid {(patient.amountPaid ?? 0).toLocaleString()}</span>
        )}
      </div>

      {needsAmount && (
        <input
          className="amount"
          type="number"
          min="0"
          placeholder="Bill amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      )}

      <div className="card-actions">
        {actionLabel && (
          <button
            className="primary"
            onClick={() =>
              onAdvance(
                patient.id,
                needsAmount
                  ? { amountDue: Number(amount) || 0 }
                  : isPaymentStep
                    ? { amountPaid: patient.amountDue }
                    : undefined,
              )
            }
          >
            {actionLabel}
          </button>
        )}
        {previousStage(patient.stage) && (
          <button className="ghost" onClick={() => onSendBack(patient.id)}>
            Back
          </button>
        )}
        <button className="ghost danger" onClick={() => onRemove(patient.id)}>
          Remove
        </button>
      </div>
    </article>
  )
}
