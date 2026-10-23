import { assembleSample } from '@/engine/assemble';
import { freeAmmonia, standardCurve } from '@/engine/convert';
import { parseNanoporeCsv } from '@/engine/parse/nanopore-csv';
import { parseQpcrCsv } from '@/engine/parse/qpcr-csv';
import { runGate } from '@/engine/qc';
import { evaluateSample, type Evaluation } from '@/engine/sdri';
import type { Chemistry, Pathogen } from '@/engine/types';

import type { Repository, RunMeta } from './repository';
import { buildSeed, SEED_VERSION } from './seed';
import type {
  Alert,
  DataState,
  PondDetail,
  PondHistoryPoint,
  Run,
  RunDetail,
  Sample,
  SampleDetail,
} from './types';

const KEY = 'aquaseq:data';
const PATHOGENS: Pathogen[] = ['pirA', 'vp28', 'swp1'];

/** Antarmuka penyimpanan minimum (AsyncStorage di aplikasi, Map di tes). */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function notFound(what: string, id: string): never {
  throw new Error(`${what} ${id} tidak ditemukan`);
}

/** Data dari penyimpanan adalah masukan tak tepercaya: rusak atau versi lain → muat ulang seed. */
function parseState(raw: string | null): DataState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<DataState>;
    const arrays = [s.farms, s.ponds, s.runs, s.samples, s.reports, s.resolvedAlerts];
    return s.version === SEED_VERSION && arrays.every(Array.isArray) ? (s as DataState) : null;
  } catch {
    return null;
  }
}

function runCurve(run: Run) {
  return standardCurve(run.standards);
}

function runGateOf(run: Run) {
  if (run.rejected) return { status: 'DITOLAK' as const, reasons: [run.rejected.reason] };
  return runGate(runCurve(run));
}

function evaluate(state: DataState, sample: Sample): SampleDetail {
  const run = state.runs.find((r) => r.id === sample.runId) ?? notFound('Run', sample.runId);
  const pond = state.ponds.find((p) => p.id === sample.pondId) ?? notFound('Kolam', sample.pondId);
  const report = state.reports.find((r) => r.sampleId === sample.id) ?? null;
  const gate = runGateOf(run);
  let evaluation: Evaluation;
  if (gate.status === 'DITOLAK') {
    // Kurva standar gagal → seluruh run DITOLAK, tidak ada skor (sdri-v1 §3).
    evaluation = {
      gate,
      components: { patho: null, chem: null, nitri: null, micro: null },
      sdri: null,
    };
  } else {
    const ref = state.samples.find((s) => s.runId === run.id && s.role === 'acuan') ?? null;
    const c = runCurve(run);
    evaluation = evaluateSample(
      assembleSample({
        wells: run.wells,
        code: sample.code,
        refCode: ref?.code ?? null,
        curve: { slope: c.slope, intercept: c.intercept },
        volumes: sample.volumes,
        chemistry: sample.chemistry,
        nanopore: sample.nanopore,
        refNanopore: ref?.nanopore ?? null,
      }),
    );
  }
  return {
    sample,
    run,
    pond,
    evaluation,
    nh3: sample.chemistry
      ? freeAmmonia(sample.chemistry.tan, sample.chemistry.ph, sample.chemistry.temperature)
      : null,
    report,
  };
}

function runDetail(state: DataState, run: Run): RunDetail {
  return {
    run,
    curve: runCurve(run),
    gate: runGateOf(run),
    samples: state.samples
      .filter((s) => s.runId === run.id)
      .map((s) => {
        const { evaluation } = evaluate(state, s);
        return {
          sample: s,
          gate: evaluation.gate,
          sdri: evaluation.sdri?.value ?? null,
          cls: evaluation.sdri?.cls ?? null,
          published: state.reports.some((r) => r.sampleId === s.id),
        };
      }),
  };
}

const byDate = (a: Sample, b: Sample) => a.takenAt.localeCompare(b.takenAt);

export function createMockRepository(store: KeyValueStore): Repository {
  let cache: DataState | null = null;

  async function load(): Promise<DataState> {
    if (cache) return cache;
    cache = parseState(await store.getItem(KEY));
    if (!cache) {
      cache = buildSeed();
      await store.setItem(KEY, JSON.stringify(cache));
    }
    return cache;
  }

  async function save(next: DataState) {
    cache = next;
    await store.setItem(KEY, JSON.stringify(next));
  }

  async function sampleOf(id: string) {
    const state = await load();
    return { state, sample: state.samples.find((s) => s.id === id) ?? notFound('Sampel', id) };
  }

  const latestOfPond = (state: DataState, pondId: string) =>
    state.samples
      .filter((s) => s.pondId === pondId)
      .sort(byDate)
      .at(-1) ?? null;

  return {
    async listRuns() {
      const state = await load();
      return [...state.runs]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((r) => runDetail(state, r));
    },

    async getRun(id) {
      const state = await load();
      return runDetail(state, state.runs.find((r) => r.id === id) ?? notFound('Run', id));
    },

    async importRunCsv(csv, meta: RunMeta) {
      const parsed = parseQpcrCsv(csv);
      if (!parsed.ok) return parsed;
      const state = await load();
      const codes = [...new Set(parsed.data.wells.map((w) => w.sampleCode))].filter(
        (c) => c !== 'NTC' && c !== 'GDC',
      );
      const errors = codes
        .filter((c) => !meta.samples.some((m) => m.code === c))
        .map((c) => ({ row: 0, message: `Sampel ${c} belum dipetakan ke kolam` }));
      for (const m of meta.samples)
        if (!state.ponds.some((p) => p.id === m.pondId))
          errors.push({ row: 0, message: `Kolam ${m.pondId} tidak ada` });
      if (errors.length) return { ok: false, errors };

      const runId = `RUN-${meta.date}-${state.runs.filter((r) => r.date === meta.date).length + 1}`;
      const run: Run = {
        id: runId,
        lab: meta.lab,
        instrument: meta.instrument,
        date: meta.date,
        standards: parsed.data.standards,
        wells: parsed.data.wells,
        provenance: 'nyata',
      };
      const samples: Sample[] = meta.samples.map((m) => ({
        id: `${m.pondId}-${runId}`,
        runId,
        pondId: m.pondId,
        code: m.code,
        role: m.role,
        takenAt: meta.date,
        doc: m.doc,
        volumes: { waterMl: 250, elutionUl: 100, templateUl: 5 },
        chemistry: null,
        nanopore: null,
        provenance: 'nyata',
      }));
      await save({ ...state, runs: [...state.runs, run], samples: [...state.samples, ...samples] });
      return { ok: true, id: runId };
    },

    async excludeWell(runId, wellId, reason) {
      if (!reason.trim()) throw new Error('Alasan wajib diisi');
      const state = await load();
      const run = state.runs.find((r) => r.id === runId) ?? notFound('Run', runId);
      if (!run.wells.some((w) => w.id === wellId)) notFound('Well', wellId);
      const at = new Date().toISOString();
      const wells = run.wells.map((w) =>
        w.id === wellId ? { ...w, excluded: { reason: reason.trim(), at } } : w,
      );
      await save({ ...state, runs: state.runs.map((r) => (r.id === runId ? { ...r, wells } : r)) });
    },

    async saveChemistry(sampleId, data: Chemistry) {
      const { state } = await sampleOf(sampleId);
      await save({
        ...state,
        samples: state.samples.map((s) => (s.id === sampleId ? { ...s, chemistry: data } : s)),
      });
    },

    async importNanoporeCsv(sampleId, csv) {
      const { state, sample } = await sampleOf(sampleId);
      const parsed = parseNanoporeCsv(csv, sample.code);
      if (!parsed.ok) return parsed;
      await save({
        ...state,
        samples: state.samples.map((s) =>
          s.id === sampleId ? { ...s, nanopore: parsed.data } : s,
        ),
      });
      return { ok: true, id: sampleId };
    },

    async getSample(id) {
      const { state, sample } = await sampleOf(id);
      return evaluate(state, sample);
    },

    async publishReport(sampleId) {
      const { state, sample } = await sampleOf(sampleId);
      const detail = evaluate(state, sample);
      if (!detail.evaluation.sdri)
        throw new Error('Sampel DITOLAK tidak bisa diterbitkan. Uji ulang dulu.');
      if (detail.report) return detail.report;
      const report = {
        id: `RPT-${sampleId}`,
        sampleId,
        publishedAt: new Date().toISOString(),
        publishedBy: 'Analis lab',
        provenance: sample.provenance,
      };
      await save({ ...state, reports: [...state.reports, report] });
      return report;
    },

    async listPonds() {
      const state = await load();
      const rows = state.ponds.map((pond) => {
        const latest = latestOfPond(state, pond.id);
        return { pond, latest: latest ? evaluate(state, latest) : null };
      });
      const score = (r: (typeof rows)[number]) => r.latest?.evaluation.sdri?.value ?? -1;
      return rows.sort((a, b) => score(b) - score(a));
    },

    async getPond(id) {
      const state = await load();
      const pond = state.ponds.find((p) => p.id === id) ?? notFound('Kolam', id);
      const details = state.samples
        .filter((s) => s.pondId === id)
        .sort(byDate)
        .map((s) => evaluate(state, s));
      const history: PondHistoryPoint[] = details.map((d) => ({
        sampleId: d.sample.id,
        takenAt: d.sample.takenAt,
        sdri: d.evaluation.sdri?.value ?? null,
        copiesMl: Object.fromEntries(
          PATHOGENS.map((p) => [
            p,
            d.evaluation.components.patho?.perTarget.find((t) => t.target === p)?.copiesMl ?? null,
          ]),
        ) as Record<Pathogen, number | null>,
      }));
      // Sampel berturut-turut terakhir (yang lolos gerbang) tanpa deteksi, per patogen (sdri-v1 §7).
      const scored = details.filter((d) => d.evaluation.components.patho).reverse();
      const ndStreak = Object.fromEntries(
        PATHOGENS.map((p) => {
          let k = 0;
          for (const d of scored) {
            const t = d.evaluation.components.patho!.perTarget.find((x) => x.target === p)!;
            if (t.status !== 'tidak terdeteksi') break;
            k++;
          }
          return [p, k];
        }),
      ) as Record<Pathogen, number>;
      return { pond, latest: details.at(-1) ?? null, history, ndStreak } satisfies PondDetail;
    },

    async listAlerts() {
      const state = await load();
      const alerts: Alert[] = [];
      for (const pond of state.ponds) {
        const latest = latestOfPond(state, pond.id);
        const sdri = latest ? evaluate(state, latest).evaluation.sdri : null;
        if (!latest || !sdri || (sdri.cls !== 'Waspada' && sdri.cls !== 'Kritis')) continue;
        alerts.push({
          id: latest.id,
          pond,
          sampleId: latest.id,
          cls: sdri.cls,
          sdri: sdri.value,
          takenAt: latest.takenAt,
          resolved: state.resolvedAlerts.includes(latest.id),
        });
      }
      return alerts.sort((a, b) => b.sdri - a.sdri);
    },

    async resolveAlert(id) {
      const state = await load();
      if (!state.resolvedAlerts.includes(id))
        await save({ ...state, resolvedAlerts: [...state.resolvedAlerts, id] });
    },

    async resetDemo() {
      await save(buildSeed());
    },
  };
}
