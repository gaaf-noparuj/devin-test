import { useMemo, useState } from 'react'
import './App.css'
import { RegisterForm } from './components/RegisterForm'
import { StageColumn } from './components/StageColumn'
import { STAGES, STAGE_LABELS } from './types'
import { usePatients } from './usePatients'

export default function App() {
  const { patients, register, advance, sendBack, remove, byStage } = usePatients()
  const [query, setQuery] = useState('')

  const stats = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        count: patients.filter((patient) => patient.stage === stage).length,
      })),
    [patients],
  )

  const revenue = patients.reduce((sum, patient) => sum + (patient.amountPaid ?? 0), 0)

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Clinic Flow</h1>
          <p className="muted">Patient check-in / check-out board</p>
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search name, HN or phone"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </header>

      <section className="stats">
        {stats.map(({ stage, count }) => (
          <div key={stage} className={`stat stat-${stage}`}>
            <span className="stat-count">{count}</span>
            <span className="stat-label">{STAGE_LABELS[stage]}</span>
          </div>
        ))}
        <div className="stat stat-revenue">
          <span className="stat-count">{revenue.toLocaleString()}</span>
          <span className="stat-label">Collected today</span>
        </div>
      </section>

      <main className="layout">
        <RegisterForm onRegister={register} />
        <div className="board">
          {STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              patients={byStage(stage, query)}
              onAdvance={advance}
              onSendBack={sendBack}
              onRemove={remove}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
