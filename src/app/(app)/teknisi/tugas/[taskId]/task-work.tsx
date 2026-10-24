"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { Camera, Play, Send, X } from "lucide-react";
import type { FormState } from "@/lib/forms";
import { compressImage } from "@/lib/image";
import { Icon } from "@/components/ui";
import { Field } from "@/components/ui/field";
import { reportTask, startTask } from "./actions";

const MAX_PHOTOS = 4;

/** Tombol "Mulai kerjakan" yang menempel di bawah layar HP. */
export function StartTask({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(startTask, {} as FormState);
  return (
    <form action={action} className="sticky-action">
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="id" value={taskId} />
      <button className="button primary wide" type="submit" disabled={pending}>
        <Icon icon={Play} />
        {pending ? "Memulai..." : "Mulai kerjakan"}
      </button>
    </form>
  );
}

type Photo = { file: File; url: string };

/** Form laporan selesai: catatan, angka ukur opsional, sampai 4 foto (dikompres di HP ≤ 1 MB). */
export function ReportForm({ taskId, measure }: { taskId: string; measure: boolean }) {
  const [state, action, pending] = useActionState(reportTask, {} as FormState);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [compressing, startCompress] = useTransition();
  const [, startSubmit] = useTransition();
  const picker = useRef<HTMLInputElement>(null);
  const v = state.values;
  const errors = state.fieldErrors ?? {};

  const addPhotos = (files: FileList | null) => {
    setPhotoError("");
    const picked = [...(files ?? [])].slice(0, MAX_PHOTOS - photos.length);
    if ((files?.length ?? 0) > picked.length) setPhotoError(`Maksimal ${MAX_PHOTOS} foto.`);
    startCompress(async () => {
      try {
        const compressed = await Promise.all(picked.map((f) => compressImage(f)));
        setPhotos((prev) => [...prev, ...compressed.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
      } catch {
        setPhotoError("Ada foto yang tidak bisa dibaca. Coba ambil ulang.");
      }
    });
  };

  const remove = (url: string) => {
    URL.revokeObjectURL(url);
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  };

  return (
    <form
      className="report-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        data.delete("photo_picker");
        for (const photo of photos) data.append("photos", photo.file);
        startSubmit(() => action(data));
      }}
    >
      <h2>Laporkan selesai</h2>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="id" value={taskId} />
      <div className="form-field">
        <label className="field-label" htmlFor="note">
          Apa yang dikerjakan?
        </label>
        <textarea
          id="note"
          name="note"
          defaultValue={v?.note}
          placeholder="Contoh: pakan sore dikurangi jadi 14,5 kg, siphon dasar selesai jam 14.30."
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={errors.note ? "note-error" : undefined}
        />
        {errors.note && (
          <p id="note-error" className="form-error">
            {errors.note}
          </p>
        )}
      </div>

      {measure && (
        <fieldset className="measure-grid">
          <legend className="field-label">Angka ukur (opsional)</legend>
          <Field name="do_mg_l" label="DO, mg/L" inputMode="decimal" defaultValue={v?.do_mg_l} error={errors.do_mg_l} />
          <Field name="ph" label="pH" inputMode="decimal" defaultValue={v?.ph} error={errors.ph} />
          <Field name="temp_c" label="Suhu, °C" inputMode="decimal" defaultValue={v?.temp_c} error={errors.temp_c} />
          <Field
            name="tan_mg_l"
            label="TAN, mg/L"
            inputMode="decimal"
            defaultValue={v?.tan_mg_l}
            error={errors.tan_mg_l}
          />
        </fieldset>
      )}

      <div className="form-field">
        <span className="field-label">
          Foto ({photos.length}/{MAX_PHOTOS})
        </span>
        <div className="photo-picker">
          {photos.map((p, i) => (
            <figure key={p.url} className="photo-thumb">
              {/* Pratinjau dari object URL lokal, jadi tanpa optimasi gambar Next. */}
              <Image src={p.url} alt={`Foto ${i + 1}`} fill sizes="120px" unoptimized />
              <button
                type="button"
                className="photo-remove"
                aria-label={`Hapus foto ${i + 1}`}
                onClick={() => remove(p.url)}
              >
                <Icon icon={X} size={16} />
              </button>
            </figure>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" className="photo-add" onClick={() => picker.current?.click()} disabled={compressing}>
              <Icon icon={Camera} size={22} />
              <span>{compressing ? "Memproses..." : "Ambil foto"}</span>
            </button>
          )}
        </div>
        <input
          ref={picker}
          type="file"
          name="photo_picker"
          accept="image/*"
          capture="environment"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        {(photoError || errors.photos) && <p className="form-error">{photoError || errors.photos}</p>}
        {!photoError && !errors.photos && (
          <p className="form-hint">Foto dikecilkan otomatis supaya cepat terkirim lewat data seluler.</p>
        )}
      </div>

      <div className="sticky-action">
        <button className="button primary wide" type="submit" disabled={pending || compressing}>
          <Icon icon={Send} />
          {pending ? "Mengirim laporan..." : "Kirim laporan"}
        </button>
      </div>
    </form>
  );
}
