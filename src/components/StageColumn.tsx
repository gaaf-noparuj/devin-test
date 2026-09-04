import type { Patient, Stage } from '../types'
import { STAGE_LABELS } from '../types'
import { PatientCard } from './PatientCard'

interface Props {
  stage: Stage
  patients: Patient[]
  onAdvance: (id: string, payload?: { amountDue?: number; amountPaid?: number }) => void
  onSendBack: (id: string) => void
  onRemove: (id: string) => void
}

export function StageColumn({ stage, patients, onAdvance, onSendBack, onRemove }: Props) {
  return (
    <section className={`column column-${stage}`}>
      <header className="column-head">
        <h3>{STAGE_LABELS[stage]}</h3>
        <span className="badge">{patients.length}</span>
      </header>
      <div className="column-body">
        {patients.length === 0 && <p className="empty">No patients</p>}
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onAdvance={onAdvance}
            onSendBack={onSendBack}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}
