"use client";

import { useRouter } from "next/navigation";

/** Filter pilihan di toolbar daftar: mengganti satu parameter URL dan mempertahankan filter lain. */
export function SelectFilter({
  label,
  param,
  value,
  options,
  basePath,
  keep = {},
}: {
  label: string;
  param: string;
  value: string;
  /** Opsi pertama bernilai "" = semua. */
  options: { value: string; label: string }[];
  basePath: string;
  keep?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const id = `filter-${param}`;
  return (
    <div className="filter-select">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams();
          for (const [key, v] of Object.entries(keep)) if (v) params.set(key, v);
          if (e.target.value) params.set(param, e.target.value);
          const query = params.toString();
          router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
