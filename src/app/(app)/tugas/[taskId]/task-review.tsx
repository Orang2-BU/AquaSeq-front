"use client";

import { useActionState, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { TaskDetail } from "@/lib/api";
import { toLocalInput } from "@/lib/format";
import type { FormState } from "@/lib/forms";
import { TaskForm, type TaskPondOption } from "@/components/app/task-dialog";
import { Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { MoreMenu } from "@/components/ui/more-menu";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";
import { reviewTask } from "../actions";

type Dialog = "close" | "redo" | "cancel" | "edit" | null;

/** Aksi pemilik di detail tugas: tutup, minta ulang (catatan wajib), ubah, batalkan. */
export function TaskReview({
  task,
  ponds,
  technicians,
}: {
  task: TaskDetail;
  ponds: TaskPondOption[];
  technicians: { id: string; full_name: string }[];
}) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const reported = task.status === "dilaporkan";
  return (
    <div className="detail-actions">
      {reported && (
        <>
          <button className="button primary" onClick={() => setDialog("close")}>
            <Icon icon={Check} />
            Tutup tugas
          </button>
          <button className="button secondary" onClick={() => setDialog("redo")}>
            <Icon icon={RotateCcw} />
            Minta ulang
          </button>
        </>
      )}
      <MoreMenu
        label="Aksi lain untuk tugas ini"
        items={[
          ...(reported ? [] : [{ label: "Ubah tugas", onSelect: () => setDialog("edit") }]),
          { label: "Batalkan tugas", onSelect: () => setDialog("cancel") },
        ]}
      />
      {dialog === "edit" && (
        <TaskForm
          mode="edit"
          taskId={task.id}
          ponds={ponds}
          technicians={technicians}
          defaults={{
            pond_id: task.pond.id,
            assignee_id: task.assignee.id,
            title: task.title,
            instruction: task.instruction,
            due_at: toLocalInput(task.due_at),
          }}
          onClose={close}
        />
      )}
      {(dialog === "close" || dialog === "redo" || dialog === "cancel") && (
        <ReviewDialog task={task} status={STATUS[dialog]} onClose={close} />
      )}
    </div>
  );
}

const STATUS = { close: "selesai", redo: "diminta_ulang", cancel: "batal" } as const;

const COPY = {
  selesai: {
    title: "Tutup tugas ini?",
    text: "Laporan diterima dan tugas selesai. Sampling berikutnya akan memperlihatkan apakah risiko kolam turun.",
    submit: "Tutup tugas",
  },
  diminta_ulang: {
    title: "Minta teknisi mengulang?",
    text: "Teknisi menerima catatanmu di HP dan tugas kembali terbuka.",
    submit: "Kirim permintaan ulang",
  },
  batal: {
    title: "Batalkan tugas ini?",
    text: "Tugas hilang dari daftar teknisi. Riwayatnya tetap tersimpan.",
    submit: "Batalkan tugas",
  },
};

function ReviewDialog({
  task,
  status,
  onClose,
}: {
  task: Pick<TaskDetail, "id">;
  status: keyof typeof COPY;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(reviewTask, {} as FormState);
  useCloseOnSuccess(state, onClose);
  const copy = COPY[status];
  const error = state.fieldErrors?.owner_note;
  return (
    <Modal title={copy.title} onClose={onClose}>
      <p className="dialog-summary">{copy.text}</p>
      <form action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="status" value={status} />
        {status !== "selesai" && (
          <div className="form-field">
            <label className="field-label" htmlFor="owner-note">
              {status === "diminta_ulang" ? "Apa yang perlu diperbaiki?" : "Alasan (opsional)"}
            </label>
            <textarea
              id="owner-note"
              name="owner_note"
              defaultValue={state.values?.owner_note}
              required={status === "diminta_ulang"}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "owner-note-error" : undefined}
            />
            {error && (
              <p id="owner-note-error" className="form-error">
                {error}
              </p>
            )}
          </div>
        )}
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Kembali
          </button>
          <button type="submit" className="button primary" disabled={pending}>
            {pending ? "Menyimpan..." : copy.submit}
          </button>
        </div>
      </form>
    </Modal>
  );
}
