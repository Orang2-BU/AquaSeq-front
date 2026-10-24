"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { previewWhatsApp, type WhatsAppPreview } from "@/app/(app)/peringatan/actions";
import { Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

/**
 * Pratinjau pesan WA (F17): teks dari backend, tombol salin + buka `wa.me`.
 * `open()` dipanggil dari event klik, jadi teks dimuat tanpa effect.
 */
export function useWhatsAppPreview(pondId: string, pondCode: string) {
  const [preview, setPreview] = useState<WhatsAppPreview | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, startLoading] = useTransition();
  const open = () => {
    setVisible(true);
    setCopied(false);
    startLoading(async () => setPreview(await previewWhatsApp(pondId)));
  };
  const message = preview?.message ?? "";
  const wa = `https://wa.me/${preview?.waTarget ?? ""}?text=${encodeURIComponent(message)}`;
  const dialog = visible && (
    <Modal title={`Pesan WhatsApp kolam ${pondCode}`} onClose={() => setVisible(false)}>
      <div aria-busy={!preview}>
        {!preview && <p className="dialog-summary">Menyiapkan teks pesan...</p>}
        {preview?.error && (
          <p className="form-alert" role="alert">
            {preview.error}
          </p>
        )}
        {message && (
          <>
            <p className="dialog-summary">
              {preview?.waTarget
                ? `Tujuan: nomor WA kolam ini (+${preview.waTarget}).`
                : "Kolam ini belum punya nomor WA tujuan. Atur di Pengaturan tambak, atau pilih kontak di WhatsApp."}
            </p>
            <pre className="wa-preview">{message}</pre>
            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(message);
                  setCopied(true);
                }}
              >
                <Icon icon={copied ? Check : Copy} />
                {copied ? "Tersalin" : "Salin teks"}
              </button>
              <a className="button primary" href={wa} target="_blank" rel="noreferrer">
                <Icon icon={ExternalLink} />
                Buka WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
  return { open, dialog };
}
