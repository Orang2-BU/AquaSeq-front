"use client";

import { useActionState, useState } from "react";
import type { Alert } from "@/lib/api";
import type { FormState } from "@/lib/forms";
import { useWhatsAppPreview } from "@/components/app/whatsapp-dialog";
import { Modal } from "@/components/ui/modal";
import { MoreMenu } from "@/components/ui/more-menu";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";
import { ackAlert } from "./actions";

/** Aksi sekunder peringatan: pratinjau WA dan tandai sudah ditangani. */
export function AlertActions({ alert }: { alert: Pick<Alert, "id" | "pond_id" | "pond_code"> }) {
  const [confirm, setConfirm] = useState(false);
  const wa = useWhatsAppPreview(alert.pond_id, alert.pond_code);
  return (
    <>
      <MoreMenu
        label={`Aksi lain untuk peringatan kolam ${alert.pond_code}`}
        items={[
          { label: "Pratinjau WA", onSelect: wa.open },
          { label: "Tandai sudah ditangani", onSelect: () => setConfirm(true) },
        ]}
      />
      {wa.dialog}
      {confirm && <AckDialog alert={alert} onClose={() => setConfirm(false)} />}
    </>
  );
}

function AckDialog({ alert, onClose }: { alert: Pick<Alert, "id" | "pond_code">; onClose: () => void }) {
  const [state, action, pending] = useActionState(ackAlert, {} as FormState);
  useCloseOnSuccess(state, onClose);
  return (
    <Modal title={`Tandai peringatan kolam ${alert.pond_code} ditangani?`} onClose={onClose}>
      <p className="dialog-summary">
        Peringatan ini hilang dari daftar. Peringatan muncul lagi bila sampel berikutnya masih berisiko.
      </p>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <form action={action} className="dialog-actions">
        <input type="hidden" name="id" value={alert.id} />
        <button type="button" className="button secondary" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Menyimpan..." : "Tandai ditangani"}
        </button>
      </form>
    </Modal>
  );
}
