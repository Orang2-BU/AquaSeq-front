import { expect, it } from "vitest";
import { documentError } from "../documents";
it("membatasi format dan ukuran dokumen", () => {
  expect(documentError(new File(["x"], "laporan.PDF"))).toBeNull();
  expect(documentError(new File(["x"], "laporan.exe"))).toBeTruthy();
  expect(documentError(new File([], "laporan.xlsx"))).toBeTruthy();
  expect(documentError(new File([new Uint8Array(4 * 1024 * 1024 + 1)], "laporan.docx"))).toBeTruthy();
});
