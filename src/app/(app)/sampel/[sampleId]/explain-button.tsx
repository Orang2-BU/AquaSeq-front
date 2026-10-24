"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import type { FormState } from "@/lib/forms";
import { Icon } from "@/components/ui";
import { writeExplanation } from "./actions";

/** Tombol tulis (ulang) penjelasan ilmiah; backend memanggil LLM maksimal sekitar 20 detik. */
export function ExplainButton({ sampleId, exists }: { sampleId: string; exists: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(writeExplanation, {});
  return (
    <form action={action} className="microbiome-upload-actions science-action">
      <input type="hidden" name="sample_id" value={sampleId} />
      <button type="submit" className={`button ${exists ? "secondary" : "primary"}`} disabled={pending}>
        <Icon icon={Sparkles} />
        {pending ? "Menulis penjelasan..." : exists ? "Tulis ulang penjelasan" : "Tulis penjelasan ilmiah"}
      </button>
      <span role="status" aria-live="polite" className="small">
        {pending && "Bisa sampai 20 detik."}
        {state.error && <span className="form-error">{state.error}</span>}
      </span>
    </form>
  );
}
