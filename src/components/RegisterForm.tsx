import { useState } from 'react'
import type { NewPatient } from '../usePatients'

const EMPTY: NewPatient = { hn: '', name: '', phone: '', birthDate: '', reason: '' }

export function RegisterForm({ onRegister }: { onRegister: (patient: NewPatient) => void }) {
  const [form, setForm] = useState<NewPatient>(EMPTY)

  function update(field: keyof NewPatient, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <form
      className="panel register"
      onSubmit={(event) => {
        event.preventDefault()
        if (!form.name.trim()) return
        onRegister(form)
        setForm(EMPTY)
      }}
    >
      <h2>Register patient</h2>

      <label>
        Full name
        <input
          required
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder="Somchai Jaidee"
        />
      </label>

      <label>
        Hospital number (HN)
        <input
          value={form.hn}
          onChange={(event) => update('hn', event.target.value)}
          placeholder="auto if empty"
        />
      </label>

      <label>
        Phone
        <input
          value={form.phone}
          onChange={(event) => update('phone', event.target.value)}
          placeholder="0812345678"
        />
      </label>

      <label>
        Date of birth
        <input
          type="date"
          value={form.birthDate}
          onChange={(event) => update('birthDate', event.target.value)}
        />
      </label>

      <label>
        Reason for visit
        <textarea
          rows={3}
          value={form.reason}
          onChange={(event) => update('reason', event.target.value)}
          placeholder="Fever, follow-up, vaccination…"
        />
      </label>

      <button type="submit" className="primary">
        Add to registered
      </button>
    </form>
  )
}
