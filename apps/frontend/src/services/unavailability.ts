import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { InstructorUnavailability } from '@sinav/shared';

export interface UnavailabilityFilters {
  search?: string;
  ogretimUyesiId?: string;
  bolumId?: string;
  fakulteId?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  overrideEdildi?: boolean;
  page?: number;
  limit?: number;
}

type UnavailabilityResponse = {
  veriler: InstructorUnavailability[];
  toplam: number;
  sayfa: number;
  limit: number;
  mesaj: string;
};

export const fetchUnavailabilities = async (filters: UnavailabilityFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.ogretimUyesiId) params.ogretimUyesiId = filters.ogretimUyesiId;
  if (filters.bolumId) params.bolumId = filters.bolumId;
  if (filters.fakulteId) params.fakulteId = filters.fakulteId;
  if (filters.baslangicTarihi) params.baslangicTarihi = filters.baslangicTarihi;
  if (filters.bitisTarihi) params.bitisTarihi = filters.bitisTarihi;
  if (filters.overrideEdildi !== undefined) params.overrideEdildi = String(filters.overrideEdildi);
  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  
  const { data } = await apiClient.get<UnavailabilityResponse>('/unavailability', {
    params,
  });
  return data;
};

export const useUnavailabilities = (filters: UnavailabilityFilters = {}) =>
  useQuery({
    queryKey: ['unavailabilities', filters],
    queryFn: () => fetchUnavailabilities(filters),
  });

export const fetchUnavailability = async (id: string) => {
  const { data } = await apiClient.get<InstructorUnavailability>(`/unavailability/${id}`);
  return data;
};

export const useUnavailability = (id?: string) =>
  useQuery({
    queryKey: ['unavailability', id],
    queryFn: () => fetchUnavailability(id as string),
    enabled: Boolean(id),
  });

export interface CreateUnavailabilityDto {
  ogretimUyesiId: string;
  baslangic: string; // ISO datetime string
  bitis: string; // ISO datetime string
  neden: string;
  kaynak?: 'manuel' | 'csv' | 'kural';
  zorla?: boolean;
}

export const createUnavailability = async (dto: CreateUnavailabilityDto) => {
  const { data } = await apiClient.post<{ mesaj: string; veri: InstructorUnavailability; uyarilar: string[] }>('/unavailability', dto);
  return data;
};

export const useCreateUnavailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUnavailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateUnavailabilityDto {
  ogretimUyesiId?: string;
  baslangic?: string;
  bitis?: string;
  neden?: string;
  kaynak?: 'manuel' | 'csv' | 'kural';
  zorla?: boolean;
}

export const updateUnavailability = async (id: string, dto: UpdateUnavailabilityDto) => {
  const { data } = await apiClient.patch<{ mesaj: string; veri: InstructorUnavailability; uyarilar: string[] }>(`/unavailability/${id}`, dto);
  return data;
};

export const useUpdateUnavailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUnavailabilityDto }) =>
      updateUnavailability(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities'] });
      queryClient.invalidateQueries({ queryKey: ['unavailability'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteUnavailability = async (id: string) => {
  const { data } = await apiClient.delete<{ mesaj: string }>(`/unavailability/${id}`);
  return data;
};

export const useDeleteUnavailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUnavailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const bulkDeleteUnavailabilities = async (ids: string[]) => {
  const { data } = await apiClient.post<{ mesaj: string }>('/unavailability/bulk-delete', { ids });
  return data;
};

export const useBulkDeleteUnavailabilities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteUnavailabilities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface ImportUnavailabilityDto {
  ogretimUyesiId: string;
  baslangic: string;
  bitis: string;
  neden: string;
  kaynak?: 'manuel' | 'csv' | 'kural';
  zorla?: boolean;
}

export const importUnavailabilities = async (kayitlar: ImportUnavailabilityDto[]) => {
  const { data } = await apiClient.post<{ mesaj: string; veri: InstructorUnavailability[]; uyarilar: string[] }>('/unavailability/import', { kayitlar });
  return data;
};

export const useImportUnavailabilities = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importUnavailabilities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unavailabilities'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const exportUnavailabilitiesCsv = async (filters: UnavailabilityFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.ogretimUyesiId) params.ogretimUyesiId = filters.ogretimUyesiId;
  if (filters.bolumId) params.bolumId = filters.bolumId;
  if (filters.fakulteId) params.fakulteId = filters.fakulteId;
  if (filters.baslangicTarihi) params.baslangicTarihi = filters.baslangicTarihi;
  if (filters.bitisTarihi) params.bitisTarihi = filters.bitisTarihi;
  if (filters.overrideEdildi !== undefined) params.overrideEdildi = String(filters.overrideEdildi);
  
  const response = await apiClient.get('/unavailability/export/csv', {
    params,
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'musait-degil-kayitlari.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

