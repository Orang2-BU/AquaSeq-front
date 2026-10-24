const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

export function documentError(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["csv", "pdf", "docx", "xlsx"].includes(ext)) {
    return "Pilih berkas dengan format .csv, .pdf, .docx, atau .xlsx.";
  }
  if (file.size === 0) {
    return "Berkas kosong.";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "Ukuran berkas melebihi batas maksimal 4 MB.";
  }
  return null;
}
