import type { Metadata } from "next";
import { Onboarding } from "./onboarding";

export const metadata: Metadata = { title: "Siapkan tambak" };

export default function Page() {
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <h1>Siapkan tambak</h1>
          <p>Tiga langkah singkat. Undangan teknisi boleh dilewati dan dikirim nanti dari halaman Tim.</p>
        </div>
      </div>
      <Onboarding />
    </div>
  );
}
