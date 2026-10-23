import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';

import type { Chemistry } from '@/engine/types';

import { createMockRepository } from './mock-repository';
import type { RunMeta } from './repository';

// Satu-satunya tempat memilih implementasi Repository. Ganti ke HttpRepository saat API backend siap.
const repo = createMockRepository(AsyncStorage);

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, retry: 1 } },
});

// Skor dihitung ulang dari data mentah, jadi setiap perubahan menyegarkan semua tampilan.
const refresh = () => queryClient.invalidateQueries();

export const usePonds = () => useQuery({ queryKey: ['ponds'], queryFn: () => repo.listPonds() });
export const usePond = (id: string) =>
  useQuery({ queryKey: ['pond', id], queryFn: () => repo.getPond(id) });
export const useRuns = () => useQuery({ queryKey: ['runs'], queryFn: () => repo.listRuns() });
export const useRun = (id: string) =>
  useQuery({ queryKey: ['run', id], queryFn: () => repo.getRun(id) });
export const useSample = (id: string) =>
  useQuery({ queryKey: ['sample', id], queryFn: () => repo.getSample(id) });
export const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: () => repo.listAlerts() });

export const useImportRun = () =>
  useMutation({
    mutationFn: (v: { csv: string; meta: RunMeta }) => repo.importRunCsv(v.csv, v.meta),
    onSuccess: refresh,
  });
export const useExcludeWell = () =>
  useMutation({
    mutationFn: (v: { runId: string; wellId: string; reason: string }) =>
      repo.excludeWell(v.runId, v.wellId, v.reason),
    onSuccess: refresh,
  });
export const useSaveChemistry = () =>
  useMutation({
    mutationFn: (v: { sampleId: string; data: Chemistry }) =>
      repo.saveChemistry(v.sampleId, v.data),
    onSuccess: refresh,
  });
export const useImportNanopore = () =>
  useMutation({
    mutationFn: (v: { sampleId: string; csv: string }) => repo.importNanoporeCsv(v.sampleId, v.csv),
    onSuccess: refresh,
  });
export const usePublish = () =>
  useMutation({
    mutationFn: (sampleId: string) => repo.publishReport(sampleId),
    onSuccess: refresh,
  });
export const useResolveAlert = () =>
  useMutation({ mutationFn: (id: string) => repo.resolveAlert(id), onSuccess: refresh });
export const useResetDemo = () =>
  useMutation({ mutationFn: () => repo.resetDemo(), onSuccess: refresh });
