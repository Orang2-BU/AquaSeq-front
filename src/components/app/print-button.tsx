"use client";

import { Printer } from "lucide-react";
import { Icon } from "@/components/ui";

/** Cetak halaman (gaya cetak menyembunyikan shell aplikasi). */
export function PrintButton() {
  return (
    <button className="button primary" onClick={() => window.print()}>
      <Icon icon={Printer} />
      Cetak
    </button>
  );
}
