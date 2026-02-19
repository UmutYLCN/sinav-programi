import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Exam, ExamConflict } from '@sinav/shared';

export interface ExamFilters {
  search?: string;
  donem?: string;
  durum?: string;
  tur?: string;
  bolumId?: string;
  cakismaVar?: boolean; // Show only exams with conflicts
  gozetmenEksik?: boolean; // Show only exams missing proctors
}

type ExamsResponse = {
  veriler: Exam[];
  toplam: number;
  sayfa: number;
  limit: number;
};

export const fetchExams = async (filters: ExamFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.donem) params.donem = filters.donem;
  if (filters.durum) params.durum = filters.durum;
  if (filters.tur) params.tur = filters.tur;
  if (filters.bolumId) params.bolumId = filters.bolumId;

  const { data } = await apiClient.get<ExamsResponse>('/exams', {
    params,
  });
  return data;
};

export const useExams = (filters: ExamFilters) =>
  useQuery({
    queryKey: ['exams', filters],
    queryFn: () => fetchExams(filters),
  });

export type ExamDetail = Exam & {
  cakismalar: ExamConflict[];
};

export const fetchExamDetail = async (id: string) => {
  const { data } = await apiClient.get<ExamDetail>(`/exams/${id}`);
  return data;
};

export interface UpdateExamInput {
  durum?: Exam['durum'];
  cakismaOnayli?: boolean;
  derslikIds?: string[];
  gozetmenIds?: string[];
  ogretimUyesiId?: string | null;
  tarih?: string;
  baslangic?: string;
  bitis?: string;
  notlar?: string;
}

export const updateExam = async (id: string, payload: UpdateExamInput) => {
  const { data } = await apiClient.patch<{ veri: ExamDetail }>(
    `/exams/${id}`,
    payload,
  );
  return data.veri;
};

export const useExamDetail = (id?: string) =>
  useQuery({
    queryKey: ['exam', id],
    queryFn: () => fetchExamDetail(id as string),
    enabled: Boolean(id),
  });

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExamInput }) =>
      updateExam(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['exam', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const deleteExam = async (id: string) => {
  const { data } = await apiClient.delete(`/exams/${id}`);
  return data;
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface CreateExamDto {
  dersId: string;
  tur?: 'sinav' | 'odev' | 'proje';
  durum?: 'planlanmadi' | 'taslak' | 'yayinlandi';
  donem?: 'guz' | 'bahar';
  sinif?: number;
  tarih?: string; // ISO date string (YYYY-MM-DD)
  baslangic?: string; // HH:mm format
  bitis?: string; // HH:mm format
  derslikId?: string; // Deprecated: Use derslikIds instead
  derslikIds?: string[]; // Multiple rooms support
  ogretimUyesiId?: string;
  ortakGrupId?: string;
  gozetmenIds?: string[]; // No limit now
  notlar?: string;
  teslimTarihi?: string | null;
  teslimLinki?: string | null;
}

export const createExam = async (dto: CreateExamDto) => {
  const { data } = await apiClient.post('/exams', dto);
  return data;
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface AutoAssignInvigilatorsDto {
  donem?: string;
  bolumId?: string;
  durum?: string;
  esikDeger?: number; // Öğrenci kapasitesi eşiği (varsayılan: 30)
  sinavIds?: string[]; // Seçili sınavlar için
}

export interface AutoAssignResult {
  mesaj: string;
  atananlar: Array<{
    sinavId: string;
    sinavKod: string;
    gozetmenSayisi: number;
    gozetmenler: Array<{ id: string; ad: string; rol: string; derslik?: string }>;
  }>;
  atanamayanlar: Array<{
    sinavId: string;
    sinavKod: string;
    sebep: string;
  }>;
  gozetmenYukleri: Record<
    string,
    { ad: string; toplamYuk: number; gunlukYukler: Record<string, number> }
  >;
}

export const autoAssignInvigilators = async (
  dto: AutoAssignInvigilatorsDto,
) => {
  const { data } = await apiClient.post<AutoAssignResult>(
    '/exams/auto-assign-invigilators',
    dto,
  );
  return data;
};

export const useAutoAssignInvigilators = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: autoAssignInvigilators,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

