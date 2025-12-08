import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Faculty } from '@sinav/shared';

type PaginatedResponse<T> = {
  veriler: T[];
  sayfa: number;
  limit: number;
  toplam: number;
  mesaj?: string;
};

export const fetchFaculties = async () => {
  const { data } = await apiClient.get<PaginatedResponse<Faculty>>(
    '/faculties',
  );
  return data;
};

export const useFaculties = () =>
  useQuery({
    queryKey: ['faculties'],
    queryFn: fetchFaculties,
  });

export interface CreateFacultyDto {
  ad: string;
  kod: string;
}

export const createFaculty = async (dto: CreateFacultyDto) => {
  const { data } = await apiClient.post('/faculties', dto);
  return data;
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const importFaculties = async (kayitlar: CreateFacultyDto[]) => {
  const { data } = await apiClient.post('/faculties/import', { kayitlar });
  return data;
};

export const useImportFaculties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importFaculties,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteFaculty = async (id: string) => {
  const { data } = await apiClient.delete(`/faculties/${id}`);
  return data;
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateFacultyDto {
  ad?: string;
  kod?: string;
}

export const updateFaculty = async (id: string, dto: UpdateFacultyDto) => {
  const { data } = await apiClient.patch(`/faculties/${id}`, dto);
  return data;
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFacultyDto }) =>
      updateFaculty(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

