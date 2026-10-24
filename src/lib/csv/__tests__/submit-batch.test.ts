import { beforeEach, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { submitBatch } from "@/app/(app)/lab/unggah/actions";
import { detectColumns, parseQpcr, summarize } from "../qpcr";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  unstable_rethrow: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  getActiveFarms: async () => ({ current: { id: "farm" } }),
  withSession: (fn: (token: string) => unknown) => fn("token"),
}));

const CSV = `well,sample_code,target,ct,tm
A1,A1,pirA,Undetermined,
B1,A1,vp28,Undetermined,
C1,A1,swp1,31.2,
D1,A1,amoA,Undetermined,
E1,A1,16S,18.4,
F1,A1,PPC,19.95,
`;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(api.ponds, "list").mockResolvedValue([
    {
      id: "pond",
      farm_id: "farm",
      pond_code: "A1",
      name: null,
      system: "intensif",
      area_sqm: null,
      current_cycle: 1,
      stocked_at: null,
      assignee: null,
      wa_target: null,
      latest_result: null,
      latest_sampling_date: null,
      trend: "INSUFFICIENT_DATA",
    },
  ]);
});

it("submitBatch mengonversi negatif penyakit hanya pada transport; ringkasan dan well tetap asli", async () => {
  const create = vi.spyOn(api.samples, "createBatch").mockResolvedValue({ batch_id: "batch", results: [] });
  const form = new FormData();
  form.set(
    "payload",
    JSON.stringify({
      csv: CSV,
      columns: detectColumns(CSV.split("\n")[0].split(",")),
      excluded: {},
      run: { lab_name: "Lab", instrument: "GSI", tested_at: "2026-10-24", file_name: "test.csv" },
      samples: [
        {
          sample_code: "A1",
          pond_id: "pond",
          sampling_date: "2026-10-24",
          water_log_id: null,
          chemistry: {
            temp_c: 29,
            ph: 7.8,
            do_mg_l: 5.8,
            tan_mg_l: 0.2,
            no2_mg_l: 0.1,
            h2s_mg_l: 0.001,
            tom_mg_l: 40,
            alkalinity: 140,
            salinity_ppt: 18,
          },
        },
      ],
    }),
  );
  const before = summarize(parseQpcr(CSV).wells);
  await expect(submitBatch({}, form)).rejects.toThrow("redirect:/lab/unggahan/batch");
  expect(create).toHaveBeenCalledOnce();
  const sample = create.mock.calls[0][1].samples[0];
  expect(sample.features).toMatchObject({ ct_ahpnd: 40, ct_wssv: 40, ct_ehp: 31.2, ct_amoa: null });
  expect(sample.meta.wells[0].ct).toBeNull();
  expect(summarize(parseQpcr(CSV).wells)).toEqual(before);
  expect(before[0].ct.ct_ahpnd).toBeNull();
});
