"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import type { Pond } from "@/lib/api";
import type { FormState } from "@/lib/forms";
import { PondsForm } from "@/components/app/ponds-form";
import { Icon } from "@/components/ui";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { MoreMenu } from "@/components/ui/more-menu";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";
import { archivePond, updatePond } from "./actions";

export function AddPondButton({ farmId, farmName }: { farmId: string; farmName: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>
        <Icon icon={Plus} />
        Tambah kolam
      </button>
      {open && (
        <Modal title={`Tambah kolam di ${farmName}`} onClose={close}>
          <p className="dialog-summary">Tulis satu atau beberapa kode kolam, pisahkan dengan koma.</p>
          <PondsForm farmId={farmId} onDone={close}>
            <button type="button" className="button secondary" onClick={close}>
              Batal
            </button>
          </PondsForm>
        </Modal>
      )}
    </>
  );
}

export type PondFields = Pick<Pond, "id" | "pond_code" | "system" | "area_sqm">;

export function PondRowActions({ pond }: { pond: PondFields }) {
  const [dialog, setDialog] = useState<"edit" | "archive" | null>(null);
  const close = () => setDialog(null);
  return (
    <>
      <MoreMenu
        label={`Aksi untuk kolam ${pond.pond_code}`}
        items={[
          { label: "Ubah", onSelect: () => setDialog("edit") },
          { label: "Arsipkan", onSelect: () => setDialog("archive") },
        ]}
      />
      {dialog === "edit" && <EditPondDialog pond={pond} onClose={close} />}
      {dialog === "archive" && <ArchivePondDialog pond={pond} onClose={close} />}
    </>
  );
}

export function EditPondDialog({ pond, onClose }: { pond: PondFields; onClose: () => void }) {
  const [state, action, pending] = useActionState(updatePond, {} as FormState);
  useCloseOnSuccess(state, onClose);
  const values = state.values ?? {
    pond_code: pond.pond_code,
    system: pond.system,
    area_sqm: pond.area_sqm === null ? "" : String(pond.area_sqm),
  };
  return (
    <Modal title={`Ubah kolam ${pond.pond_code}`} onClose={onClose}>
      <form action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="id" value={pond.id} />
        <Field
          name="pond_code"
          label="Kode kolam"
          required
          autoCapitalize="characters"
          defaultValue={values.pond_code}
          error={state.fieldErrors?.pond_code}
        />
        <div className="form-field">
          <label className="field-label" htmlFor="edit-system">
            Sistem budidaya
          </label>
          <select id="edit-system" name="system" defaultValue={values.system}>
            <option value="intensif">Intensif</option>
            <option value="bioflok">Bioflok</option>
          </select>
        </div>
        <Field
          name="area_sqm"
          label="Luas, m² (opsional)"
          inputMode="decimal"
          defaultValue={values.area_sqm}
          error={state.fieldErrors?.area_sqm}
        />
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Batal
          </button>
          <button className="button primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ArchivePondDialog({
  pond,
  onClose,
  backToList = false,
}: {
  pond: PondFields;
  onClose: () => void;
  /** Dari halaman detail: kembali ke daftar kolam setelah diarsipkan. */
  backToList?: boolean;
}) {
  const [state, action, pending] = useActionState(archivePond, {} as FormState);
  useCloseOnSuccess(state, onClose);
  return (
    <Modal title={`Arsipkan kolam ${pond.pond_code}?`} onClose={onClose}>
      <p className="dialog-summary">
        Kolam ini hilang dari daftar dan dilepas dari teknisinya. Hasil lab dan riwayat tugasnya tetap tersimpan.
      </p>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <form action={action} className="dialog-actions">
        <input type="hidden" name="id" value={pond.id} />
        {backToList && <input type="hidden" name="back" value="1" />}
        <button type="button" className="button secondary" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Mengarsipkan..." : "Arsipkan kolam"}
        </button>
      </form>
    </Modal>
  );
}
