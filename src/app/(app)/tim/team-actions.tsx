"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";
import type { Member, PendingInvitation } from "@/lib/api";
import type { FormState } from "@/lib/forms";
import { InviteForm } from "@/components/app/invite-form";
import { Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { MoreMenu } from "@/components/ui/more-menu";
import { useCloseOnSuccess } from "@/components/ui/use-close-on-success";
import { assignPonds, revokeInvitation, setMemberActive } from "./actions";

type PondOption = { id: string; pond_code: string; assignee: { id: string; full_name: string } | null };

export function InviteButton({ farmId, ponds }: { farmId: string; ponds: PondOption[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>
        <Icon icon={UserPlus} />
        Undang teknisi
      </button>
      {open && (
        <Modal title="Undang teknisi" onClose={close}>
          <InviteForm
            farmId={farmId}
            ponds={ponds}
            secondary={(sent) => (
              <button type="button" className="button secondary" onClick={close}>
                {sent ? "Selesai" : "Batal"}
              </button>
            )}
          />
        </Modal>
      )}
    </>
  );
}

function FormAlert({ state }: { state: FormState }) {
  if (!state.error) return null;
  return (
    <p className="form-alert" role="alert">
      {state.error}
    </p>
  );
}

const firstName = (name: string) => name.split(" ")[0];

export function MemberRowActions({ farmId, member, ponds }: { farmId: string; member: Member; ponds: PondOption[] }) {
  const [dialog, setDialog] = useState<"assign" | "active" | null>(null);
  const close = () => setDialog(null);
  return (
    <>
      <MoreMenu
        label={`Aksi untuk ${member.full_name}`}
        items={[
          ...(member.active ? [{ label: "Bagi kolam", onSelect: () => setDialog("assign") }] : []),
          { label: member.active ? "Nonaktifkan" : "Aktifkan", onSelect: () => setDialog("active") },
        ]}
      />
      {dialog === "assign" && <AssignDialog farmId={farmId} member={member} ponds={ponds} onClose={close} />}
      {dialog === "active" && <ActiveDialog farmId={farmId} member={member} onClose={close} />}
    </>
  );
}

function AssignDialog({
  farmId,
  member,
  ponds,
  onClose,
}: {
  farmId: string;
  member: Member;
  ponds: PondOption[];
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(assignPonds, {} as FormState);
  useCloseOnSuccess(state, onClose);
  return (
    <Modal title={`Bagi kolam untuk ${member.full_name}`} onClose={onClose}>
      <p className="dialog-summary">
        Kolam yang dicentang pindah ke {firstName(member.full_name)}. Kolam miliknya yang tidak dicentang dilepas.
      </p>
      <FormAlert state={state} />
      <form action={action} className="auth-form">
        <input type="hidden" name="farm_id" value={farmId} />
        <input type="hidden" name="user_id" value={member.user_id} />
        <fieldset className="assign-list">
          <legend className="sr-only">Kolam di lokasi ini</legend>
          {ponds.map((pond) => {
            const other = pond.assignee && pond.assignee.id !== member.user_id ? pond.assignee : null;
            return (
              <label key={pond.id} className="assign-row">
                <input
                  type="checkbox"
                  name="pond_ids"
                  value={pond.id}
                  defaultChecked={pond.assignee?.id === member.user_id}
                />
                <span className="mono">{pond.pond_code}</span>
                {other && <span className="small muted">dipegang {firstName(other.full_name)}</span>}
              </label>
            );
          })}
        </fieldset>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Batal
          </button>
          <button className="button primary" type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan pembagian"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ActiveDialog({ farmId, member, onClose }: { farmId: string; member: Member; onClose: () => void }) {
  const [state, action, pending] = useActionState(setMemberActive, {} as FormState);
  useCloseOnSuccess(state, onClose);
  const deactivate = member.active;
  return (
    <Modal title={`${deactivate ? "Nonaktifkan" : "Aktifkan"} ${member.full_name}?`} onClose={onClose}>
      <p className="dialog-summary">
        {deactivate
          ? `${firstName(member.full_name)} tidak bisa masuk ke lokasi ini lagi.${
              member.pond_codes.length ? ` Kolam ${member.pond_codes.join(", ")} dilepas dan perlu dibagi ulang.` : ""
            }`
          : `${firstName(member.full_name)} bisa masuk lagi. Bagi kolam setelah diaktifkan.`}
      </p>
      <FormAlert state={state} />
      <form action={action} className="dialog-actions">
        <input type="hidden" name="farm_id" value={farmId} />
        <input type="hidden" name="user_id" value={member.user_id} />
        <input type="hidden" name="active" value={deactivate ? "0" : "1"} />
        <button type="button" className="button secondary" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Menyimpan..." : deactivate ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </form>
    </Modal>
  );
}

export function InvitationRowActions({ invitation }: { invitation: PendingInvitation }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MoreMenu
        label={`Aksi untuk undangan ${invitation.email}`}
        items={[{ label: "Batalkan undangan", onSelect: () => setOpen(true) }]}
      />
      {open && <RevokeDialog invitation={invitation} onClose={() => setOpen(false)} />}
    </>
  );
}

function RevokeDialog({ invitation, onClose }: { invitation: PendingInvitation; onClose: () => void }) {
  const [state, action, pending] = useActionState(revokeInvitation, {} as FormState);
  useCloseOnSuccess(state, onClose);
  return (
    <Modal title="Batalkan undangan?" onClose={onClose}>
      <p className="dialog-summary">Tautan undangan untuk {invitation.email} tidak bisa dipakai lagi.</p>
      <FormAlert state={state} />
      <form action={action} className="dialog-actions">
        <input type="hidden" name="id" value={invitation.id} />
        <button type="button" className="button secondary" onClick={onClose}>
          Kembali
        </button>
        <button type="submit" className="button primary" disabled={pending}>
          {pending ? "Membatalkan..." : "Batalkan undangan"}
        </button>
      </form>
    </Modal>
  );
}
