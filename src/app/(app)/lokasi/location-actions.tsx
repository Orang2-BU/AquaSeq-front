"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { Farm } from "@/lib/api";
import type { FormState } from "@/lib/forms";
import { selectFarm } from "@/app/(app)/actions";
import { FarmForm } from "@/components/app/farm-form";
import { Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { MoreMenu } from "@/components/ui/more-menu";
import { archiveFarm } from "./actions";

type FarmFields = Pick<Farm, "id" | "name" | "regency" | "address">;

export function AddLocationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>
        <Icon icon={Plus} />
        Tambah lokasi
      </button>
      {open && (
        <Modal title="Tambah lokasi" onClose={() => setOpen(false)}>
          <FarmForm submitLabel="Simpan lokasi" onSaved={() => setOpen(false)}>
            <button type="button" className="button secondary" onClick={() => setOpen(false)}>
              Batal
            </button>
          </FarmForm>
        </Modal>
      )}
    </>
  );
}

/** Aksi di kartu lokasi: pilih sebagai lokasi aktif, ubah, arsipkan. */
export function LocationCardActions({ farm, selected }: { farm: FarmFields; selected: boolean }) {
  const [dialog, setDialog] = useState<"edit" | "archive" | null>(null);
  const [switching, startSwitch] = useTransition();
  const close = () => setDialog(null);
  return (
    <div className="location-actions">
      {!selected && (
        <button
          className="button secondary"
          disabled={switching}
          onClick={() => startSwitch(() => selectFarm(farm.id))}
        >
          {switching ? "Mengganti..." : "Jadikan lokasi aktif"}
        </button>
      )}
      <MoreMenu
        label={`Aksi lain untuk ${farm.name}`}
        items={[
          { label: "Ubah", onSelect: () => setDialog("edit") },
          { label: "Arsipkan", onSelect: () => setDialog("archive") },
        ]}
      />
      {dialog === "edit" && (
        <Modal title="Ubah lokasi" onClose={close}>
          <FarmForm farm={farm} submitLabel="Simpan perubahan" onSaved={close}>
            <button type="button" className="button secondary" onClick={close}>
              Batal
            </button>
          </FarmForm>
        </Modal>
      )}
      {dialog === "archive" && <ArchiveDialog farm={farm} onClose={close} />}
    </div>
  );
}

function ArchiveDialog({ farm, onClose }: { farm: FarmFields; onClose: () => void }) {
  const [state, action, pending] = useActionState(archiveFarm, {} as FormState);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);
  return (
    <Modal title={`Arsipkan ${farm.name}?`} onClose={onClose}>
      <p className="dialog-summary">
        Lokasi ini hilang dari pemilih lokasi dan tidak bisa diberi tugas baru. Kolam, hasil lab, dan riwayat tugas
        tetap tersimpan.
      </p>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <form action={action} className="dialog-actions">
        <input type="hidden" name="id" value={farm.id} />
        <button type="button" className="button secondary" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Mengarsipkan..." : "Arsipkan lokasi"}
        </button>
      </form>
    </Modal>
  );
}
