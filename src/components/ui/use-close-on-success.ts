"use client";

import { useEffect, useEffectEvent } from "react";
import type { FormState } from "@/lib/forms";

/** Tutup dialog sekali setelah Server Action berhasil, walau induk membuat `onClose` baru tiap render. */
export function useCloseOnSuccess(state: FormState, onClose: () => void) {
  const handleClose = useEffectEvent(onClose);
  useEffect(() => {
    if (state.ok) handleClose();
  }, [state]);
}
