"use client";

import { useActionState, useState } from "react";
import { ClipboardPlus } from "lucide-react";
import type { TaskKind } from "@/lib/api";
import type { FormState } from "@/lib/forms";
import { TASK_KIND } from "@/lib/tasks";
import { createTask, editTask } from "@/app/(app)/tugas/actions";
import { Icon } from "@/components/ui";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";

export type TaskPondOption = { id: string; pond_code: string; assignee: { id: string; full_name: string } | null };
export type TaskDefaults = {
  pond_id?: string;
  assignee_id?: string;
  kind?: TaskKind;
  title?: string;
  instruction?: string;
  source_sample_id?: string;
  source_alert_id?: string;
};

/** Besok jam 09.00 WIB sebagai nilai `datetime-local`. */
function tomorrowMorning() {
  const wib = new Date(Date.now() + 7 * 3_600_000 + 86_400_000);
  return `${wib.toISOString().slice(0, 10)}T09:00`;
}

/** Tombol + modal buat tugas (08-DESIGN "Modal buat tugas"): kolam dan teknisi terisi, instruksi dari backend. */
export function CreateTaskButton({
  ponds,
  technicians,
  defaults = {},
  label = "Buat tugas",
  variant = "primary",
}: {
  ponds: TaskPondOption[];
  technicians: { id: string; full_name: string }[];
  defaults?: TaskDefaults;
  label?: string;
  variant?: "primary" | "secondary" | "inverse";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={`button ${variant}`} onClick={() => setOpen(true)}>
        <Icon icon={ClipboardPlus} />
        {label}
      </button>
      {open && (
        <TaskForm
          mode="create"
          ponds={ponds}
          technicians={technicians}
          defaults={defaults}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function TaskForm({
  mode,
  ponds,
  technicians,
  defaults,
  taskId,
  onClose,
}: {
  mode: "create" | "edit";
  ponds: TaskPondOption[];
  technicians: { id: string; full_name: string }[];
  defaults: TaskDefaults & { due_at?: string };
  taskId?: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(mode === "create" ? createTask : editTask, {} as FormState);
  useCloseOnSuccess(state, onClose);
  const firstPond = ponds.find((p) => p.id === defaults.pond_id) ?? ponds[0];
  const [pondId, setPondId] = useState(state.values?.pond_id ?? firstPond?.id ?? "");
  const pond = ponds.find((p) => p.id === pondId);
  const [assigneeId, setAssigneeId] = useState(
    state.values?.assignee_id ?? defaults.assignee_id ?? pond?.assignee?.id ?? technicians[0]?.id ?? "",
  );
  const assignee = technicians.find((t) => t.id === assigneeId);
  const v = state.values;
  const errors = state.fieldErrors ?? {};
  const noTechnician = technicians.length === 0;

  return (
    <Modal title={mode === "create" ? "Buat tugas" : "Ubah tugas"} onClose={onClose} className="modal-wide">
      {noTechnician ? (
        <p className="dialog-summary">
          Belum ada teknisi aktif di lokasi ini. Undang teknisi dulu dari halaman Tim, lalu buat tugas.
        </p>
      ) : (
        <form action={action} className="auth-form" noValidate>
          {state.error && (
            <p className="form-alert" role="alert">
              {state.error}
            </p>
          )}
          {taskId && <input type="hidden" name="id" value={taskId} />}
          {defaults.source_sample_id && (
            <input type="hidden" name="source_sample_id" value={defaults.source_sample_id} />
          )}
          {defaults.source_alert_id && <input type="hidden" name="source_alert_id" value={defaults.source_alert_id} />}
          <div className="form-grid">
            {mode === "create" && (
              <div className="form-field">
                <label className="field-label" htmlFor="task-kind">
                  Jenis tugas
                </label>
                <select id="task-kind" name="kind" defaultValue={v?.kind ?? defaults.kind ?? "tindakan"}>
                  {Object.entries(TASK_KIND).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {mode === "create" && (
              <div className="form-field">
                <label className="field-label" htmlFor="task-pond">
                  Kolam
                </label>
                <select
                  id="task-pond"
                  name="pond_id"
                  value={pondId}
                  onChange={(e) => {
                    setPondId(e.target.value);
                    const holder = ponds.find((p) => p.id === e.target.value)?.assignee;
                    if (holder && technicians.some((t) => t.id === holder.id)) setAssigneeId(holder.id);
                  }}
                  aria-invalid={errors.pond_id ? true : undefined}
                >
                  {ponds.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pond_code}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field">
              <label className="field-label" htmlFor="task-assignee">
                Teknisi
              </label>
              <select
                id="task-assignee"
                name="assignee_id"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                aria-invalid={errors.assignee_id ? true : undefined}
                aria-describedby={errors.assignee_id ? "task-assignee-error" : undefined}
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                    {pond?.assignee?.id === t.id ? " (pemegang kolam)" : ""}
                  </option>
                ))}
              </select>
              {errors.assignee_id && (
                <p id="task-assignee-error" className="form-error">
                  {errors.assignee_id}
                </p>
              )}
            </div>
            <Field
              name="due_at"
              label="Jatuh tempo"
              type="datetime-local"
              required
              defaultValue={v?.due_at ?? defaults.due_at ?? tomorrowMorning()}
              error={errors.due_at}
            />
          </div>
          <Field
            name="title"
            label="Judul"
            required
            maxLength={120}
            defaultValue={v?.title ?? defaults.title ?? (pond ? `Tindak lanjut kolam ${pond.pond_code}` : "")}
            error={errors.title}
          />
          <div className="form-field">
            <label className="field-label" htmlFor="task-instruction">
              Instruksi
            </label>
            <textarea
              id="task-instruction"
              name="instruction"
              defaultValue={v?.instruction ?? defaults.instruction ?? ""}
              aria-invalid={errors.instruction ? true : undefined}
              aria-describedby="task-instruction-help"
            />
            <p id="task-instruction-help" className={errors.instruction ? "form-error" : "form-hint"}>
              {errors.instruction ??
                (defaults.instruction
                  ? "Terisi dari rekomendasi analisis. Boleh diubah."
                  : "Tulis langkah yang jelas.")}
            </p>
          </div>
          {assignee && (
            <p className="task-summary" role="status">
              {assignee.full_name.split(" ")[0]} akan menerima tugas ini di HP.
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Batal
            </button>
            <button className="button primary" type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : mode === "create" ? "Kirim tugas" : "Simpan perubahan"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
