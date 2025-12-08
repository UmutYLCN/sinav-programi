import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  InvigilatorLoadDetail,
  InvigilatorLoadItem,
} from '@sinav/shared';

export interface InvigilatorLoadFilters {
  donem?: string;
  fakulteId?: string;
  bolumId?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}

type InvigilatorLoadListResponse = {
  veriler: InvigilatorLoadItem[];
};

const sanitizeFilters = (filters: InvigilatorLoadFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== '',
    ),
  );

export const fetchInvigilatorLoadList = async (
  filters: InvigilatorLoadFilters = {},
) => {
  const { data } = await apiClient.get<InvigilatorLoadListResponse>(
    '/invigilator-load',
    {
      params: sanitizeFilters(filters),
    },
  );
  return data.veriler;
};

export const fetchInvigilatorLoadDetail = async (
  id: string,
  filters: InvigilatorLoadFilters = {},
) => {
  const { data } = await apiClient.get<InvigilatorLoadDetail>(
    `/invigilator-load/${id}`,
    {
      params: sanitizeFilters(filters),
    },
  );
  return data;
};

export const useInvigilatorLoadList = (filters: InvigilatorLoadFilters) =>
  useQuery({
    queryKey: ['invigilator-load-list', filters],
    queryFn: () => fetchInvigilatorLoadList(filters),
  });

export const useInvigilatorLoadDetail = (
  id?: string | null,
  filters?: InvigilatorLoadFilters,
) =>
  useQuery({
    queryKey: ['invigilator-load-detail', id, filters],
    queryFn: () => fetchInvigilatorLoadDetail(id as string, filters ?? {}),
    enabled: Boolean(id),
  });

