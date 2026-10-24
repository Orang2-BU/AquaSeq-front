"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { FarmForm } from "@/components/app/farm-form";
import { InviteForm } from "@/components/app/invite-form";
import { PondsForm } from "@/components/app/ponds-form";
import { Icon } from "@/components/ui";

const STEPS = ["Lokasi", "Kolam", "Undang teknisi"] as const;
type Pond = { id: string; pond_code: string };

/** P12: lokasi → kolam → undang teknisi (langkah 3 boleh dilewati). */
export function Onboarding() {
  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState<{ id: string; name: string } | null>(null);
  const [ponds, setPonds] = useState<Pond[]>([]);
  return (
    <>
      <ol className="toggle flow-steps" aria-label="Langkah menyiapkan tambak">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`toggle-item ${i === step ? "selected" : ""} ${i < step ? "done" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            {i < step && <Icon icon={Check} size={14} />}
            {i + 1}. {label}
          </li>
        ))}
      </ol>
      <section className="onboarding-card">
        {step === 0 && (
          <>
            <h2>Lokasi tambak</h2>
            <p className="muted">Satu lokasi berisi beberapa kolam dan teknisi. Lokasi lain bisa ditambah nanti.</p>
            <FarmForm
              activate
              submitLabel="Simpan dan lanjut"
              onSaved={(saved) => {
                setFarm(saved);
                setStep(1);
              }}
            />
          </>
        )}
        {step === 1 && farm && (
          <>
            <h2>Kolam di {farm.name}</h2>
            <p className="muted">
              Tulis kode kolam yang biasa dipakai di tambak, misalnya A1, A2, B1. Pisahkan dengan koma.
            </p>
            <PondsForm
              farmId={farm.id}
              onDone={(created) => {
                setPonds(created);
                setStep(2);
              }}
            />
          </>
        )}
        {step === 2 && farm && (
          <>
            <h2>Undang teknisi</h2>
            <InviteForm
              farmId={farm.id}
              ponds={ponds}
              secondary={(sent) => (
                <Link className="button secondary" href="/dasbor">
                  {sent ? "Selesai, ke dasbor" : "Lewati, nanti saja"}
                </Link>
              )}
            />
          </>
        )}
      </section>
    </>
  );
}
