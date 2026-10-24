import { redirect } from "next/navigation";

// P44: pengarah peran. Sebelum sesi ada (T5), semua diarahkan ke dasbor pemilik.
export default function Page() {
  redirect("/dasbor");
}
