"use client";

import { useState } from "react";
import { CycleDialog } from "@/components/app/cycle-dialog";
import { useWhatsAppPreview } from "@/components/app/whatsapp-dialog";
import { MoreMenu } from "@/components/ui/more-menu";
import { ArchivePondDialog, EditPondDialog, type PondFields } from "../pond-actions";

/** Aksi sekunder detail kolam (P15): ubah, catat hasil siklus, pratinjau WA, arsipkan. */
export function PondMenu({ pond, hasResult }: { pond: PondFields & { current_cycle: number }; hasResult: boolean }) {
  const [dialog, setDialog] = useState<"edit" | "cycle" | "archive" | null>(null);
  const wa = useWhatsAppPreview(pond.id, pond.pond_code);
  const close = () => setDialog(null);
  return (
    <>
      <MoreMenu
        label={`Aksi lain untuk kolam ${pond.pond_code}`}
        items={[
          { label: "Ubah kolam", onSelect: () => setDialog("edit") },
          { label: "Catat hasil siklus", onSelect: () => setDialog("cycle") },
          ...(hasResult ? [{ label: "Pratinjau WA", onSelect: wa.open }] : []),
          { label: "Arsipkan", onSelect: () => setDialog("archive") },
        ]}
      />
      {wa.dialog}
      {dialog === "edit" && <EditPondDialog pond={pond} onClose={close} />}
      {dialog === "cycle" && <CycleDialog pond={pond} onClose={close} />}
      {dialog === "archive" && <ArchivePondDialog pond={pond} onClose={close} backToList />}
    </>
  );
}
