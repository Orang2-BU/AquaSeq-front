// Kompres foto di browser (03-ARCHITECTURE §4): canvas, JPEG, maks 1 MB, tanpa library.

const MAX_SIDE = 1600;

/** Perkecil foto sampai ≤ `maxBytes`: turunkan kualitas dulu, lalu ukuran. */
export async function compressImage(file: File, maxBytes = 1_000_000): Promise<File> {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  let quality = 0.82;
  for (;;) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Foto tidak bisa diproses.");
    if (blob.size <= maxBytes || scale < 0.3) {
      bitmap.close();
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
    if (quality > 0.55) quality -= 0.12;
    else scale *= 0.8;
  }
}
