"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import type { FormState } from "@/lib/forms";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui";
import { uploadMicrobiome } from "./actions";

/** Form unggah tabel kelimpahan 16S (kolom taxon, genus opsional, reads) untuk satu sampel. */
export function MicrobiomeUpload({ sampleId, replace }: { sampleId: string; replace: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadMicrobiome, {});
  return (
    <form action={action} className="microbiome-upload">
      <input type="hidden" name="sample_id" value={sampleId} />
      <Field
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
        label={replace ? "Ganti tabel kelimpahan (.csv)" : "Tabel kelimpahan 16S (.csv)"}
        hint="Kolom taxon dan reads wajib, genus opsional. Maksimal 2 MB."
        error={state.fieldErrors?.file}
      />
      <Field
        name="source"
        label="Sumber (opsional)"
        maxLength={120}
        placeholder="Lab mitra (16S)"
        error={state.fieldErrors?.source}
      />
      <div className="microbiome-upload-actions">
        <button type="submit" className="button primary" disabled={pending}>
          <Icon icon={Upload} />
          {pending ? "Mengunggah..." : "Unggah dan hitung"}
        </button>
        <a className="text-link" href="/templates/aquaseq-kelimpahan-contoh.csv" download>
          Unduh contoh tabel
        </a>
      </div>
      <div role="status" aria-live="polite">
        {state.ok && <p className="small">Tabel tersimpan. Metrik diperbarui dari backend.</p>}
        {state.error && !state.fieldErrors && <p className="form-alert">{state.error}</p>}
      </div>
    </form>
  );
}
