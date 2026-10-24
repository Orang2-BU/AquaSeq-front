"use client";

import { useActionState, useState } from "react";
import type { Cycle } from "@/lib/api";
import { CYCLE_OUTCOME, PATHOGENS } from "@/lib/cycles";
import type { FormState } from "@/lib/forms";
import { recordCycle } from "@/app/(app)/kolam/actions";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";

/** Modal catat hasil siklus (P15, P21): data kalibrasi model backend. */
export function CycleDialog({
  pond,
  onClose,
}: {
  pond: { id: string; pond_code: string; current_cycle: number };
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(recordCycle, {} as FormState);
  useCloseOnSuccess(state, onClose);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const [outcome, setOutcome] = useState<Cycle["outcome"]>(
    (v?.outcome as Cycle["outcome"] | undefined) ?? "HARVEST_SUCCESS",
  );
  const outbreak = outcome !== "HARVEST_SUCCESS";
  return (
    <Modal title={`Catat hasil siklus kolam ${pond.pond_code}`} onClose={onClose}>
      <p className="dialog-summary">
        Hasil panen atau wabah dipakai tim analisis untuk mengkalibrasi model. Satu siklus dicatat sekali.
      </p>
      <form action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="pond_id" value={pond.id} />
        <div className="form-grid">
          <Field
            name="cycle_number"
            label="Siklus ke"
            inputMode="numeric"
            required
            defaultValue={v?.cycle_number ?? String(pond.current_cycle)}
            error={errors.cycle_number}
          />
          <div className="form-field">
            <label className="field-label" htmlFor="cycle-outcome">
              Hasil
            </label>
            <select
              id="cycle-outcome"
              name="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as Cycle["outcome"])}
            >
              {Object.entries(CYCLE_OUTCOME).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Field
            name="actual_harvest_kg"
            label="Panen, kg"
            inputMode="decimal"
            defaultValue={v?.actual_harvest_kg}
            error={errors.actual_harvest_kg}
          />
          {outbreak && (
            <Field
              name="outbreak_date"
              label="Tanggal wabah terlihat"
              type="date"
              required
              defaultValue={v?.outbreak_date}
              error={errors.outbreak_date}
            />
          )}
        </div>
        {outbreak && (
          <div className="form-field">
            <label className="field-label" htmlFor="cycle-pathogen">
              Patogen dugaan
            </label>
            <select
              id="cycle-pathogen"
              name="primary_suspect_pathogen"
              defaultValue={v?.primary_suspect_pathogen ?? "AHPND"}
            >
              {PATHOGENS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-field">
          <label className="field-label" htmlFor="cycle-notes">
            Catatan (opsional)
          </label>
          <textarea id="cycle-notes" name="notes" defaultValue={v?.notes} maxLength={500} />
          {errors.notes && <p className="form-error">{errors.notes}</p>}
        </div>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Batal
          </button>
          <button className="button primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan hasil siklus"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function CycleButton({ pond }: { pond: { id: string; pond_code: string; current_cycle: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>
        Catat hasil siklus
      </button>
      {open && <CycleDialog pond={pond} onClose={() => setOpen(false)} />}
    </>
  );
}
