import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Exam,
  Instructor,
  InstructorUnavailability,
  KullaniciRol,
} from '@sinav/shared';

type InstructorsResponse = {
  veriler: Instructor[];
  toplam: number;
};

export const fetchInstructors = async () => {
  const { data } = await apiClient.get<InstructorsResponse>('/instructors', {
    params: { limit: 200 },
  });
  return data.veriler;
};

export const useInstructors = () =>
  useQuery({
    queryKey: ['instructors'],
    queryFn: fetchInstructors,
  });

export interface InstructorScheduleResponse {
  sinavlar: Exam[];
  musaitDegiller: InstructorUnavailability[];
}

export const fetchInstructorSchedule = async (
  id: string,
  params: { baslangic?: string; bitis?: string } = {},
) => {
  const { data } = await apiClient.get<InstructorScheduleResponse>(
    `/instructors/${id}/schedule`,
    {
      params,
    },
  );
  return data;
};

export const useInstructorSchedule = (
  id?: string | null,
  dateRange?: { baslangic?: string; bitis?: string },
) =>
  useQuery({
    queryKey: ['instructor-schedule', id, dateRange],
    queryFn: () => fetchInstructorSchedule(id as string, dateRange ?? {}),
    enabled: Boolean(id),
  });

export interface CreateInstructorDto {
  ad: string;
  email: string;
  bolumId: string;
  roller?: KullaniciRol[];
  aktif?: boolean;
}

export const createInstructor = async (dto: CreateInstructorDto) => {
  const { data } = await apiClient.post('/instructors', dto);
  return data;
};

export const useCreateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const importInstructors = async (kayitlar: CreateInstructorDto[]) => {
  const { data } = await apiClient.post('/instructors/import', { kayitlar });
  return data;
};

export const useImportInstructors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importInstructors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteInstructor = async (id: string) => {
  const { data } = await apiClient.delete(`/instructors/${id}`);
  return data;
};

export const useDeleteInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateInstructorDto {
  ad?: string;
  email?: string;
  bolumId?: string;
  roller?: KullaniciRol[];
  aktif?: boolean;
}

export const updateInstructor = async (id: string, dto: UpdateInstructorDto) => {
  const { data } = await apiClient.patch(`/instructors/${id}`, dto);
  return data;
};

export const useUpdateInstructor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInstructorDto }) =>
      updateInstructor(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

