import { redirect } from "next/navigation";

// P44: pengarah peran sebenarnya ada di proxy.ts; halaman ini cadangan bila proxy dilewati.
export default function Page() {
  redirect("/dasbor");
}
