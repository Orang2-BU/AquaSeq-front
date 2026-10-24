/** Simbol sementara (tetes air bergaris) sampai logo dibuat (08-DESIGN Shapes). */
function BrandSymbol() {
  return (
    <svg className="brand-symbol" viewBox="0 0 28 38" aria-hidden="true">
      <path fill="var(--color-primary)" d="M14 1C14 1 2 15.5 2 24a12 12 0 0 0 24 0C26 15.5 14 1 14 1Z" />
      <path
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        d="M7.5 25.5c2.2-1.6 4.3-1.6 6.5 0s4.3 1.6 6.5 0"
      />
    </svg>
  );
}

export function BrandWordmark() {
  return <span className="brand-wordmark">AquaSeq</span>;
}

/** Isi baris brand: simbol + wordmark + caption (label disembunyikan saat sidebar ciut). */
export function BrandLockup() {
  return (
    <>
      <BrandSymbol />
      <span className="nav-label">
        <BrandWordmark />
        <span className="brand-caption">Pemantau risiko kolam</span>
      </span>
    </>
  );
}
