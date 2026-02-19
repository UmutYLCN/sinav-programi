import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Course, Donem } from '@sinav/shared';
export type { Course };

type CoursesResponse = {
  veriler: Course[];
  toplam: number;
};

export const fetchCourses = async (params: { bolumId?: string } = {}) => {
  const queryParams: Record<string, string | number> = {
    limit: 200,
  };
  if (params.bolumId) {
    queryParams.bolumId = params.bolumId;
  }

  const { data } = await apiClient.get<CoursesResponse>('/courses', {
    params: queryParams,
  });
  return data.veriler;
};

export const useCourses = (bolumId?: string) =>
  useQuery({
    queryKey: ['courses', bolumId],
    queryFn: () => fetchCourses({ bolumId }),
  });

export interface CreateCourseDto {
  kod: string;
  ad: string;
  sinif: number;
  donem: Donem;
  bolumId: string;
  kredi?: number;
  ogrenciKapasitesi?: number;
}

export const createCourse = async (dto: CreateCourseDto) => {
  console.log('🔍 SERVICE - createCourse çağrıldı');
  console.log('🔍 SERVICE - Gönderilecek DTO:', JSON.stringify(dto, null, 2));
  console.log('🔍 SERVICE - DTO ogrenciKapasitesi:', dto.ogrenciKapasitesi);
  console.log('🔍 SERVICE - DTO ogrenciKapasitesi type:', typeof dto.ogrenciKapasitesi);
  const { data } = await apiClient.post('/courses', dto);
  console.log('🔍 SERVICE - API yanıtı:', JSON.stringify(data, null, 2));
  return data;
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface ImportCourseDto {
  kod: string;
  ad: string;
  sinif: number;
  donem: Donem;
  bolumId?: string;
  bolumKod?: string;
  bolumAd?: string;
  kredi?: number;
  ogrenciKapasitesi?: number;
}

export const importCourses = async (kayitlar: ImportCourseDto[]) => {
  console.log('🔍 SERVICE - importCourses çağrıldı');
  console.log('🔍 SERVICE - Gönderilecek kayıtlar:', JSON.stringify(kayitlar.slice(0, 2), null, 2));
  console.log('🔍 SERVICE - Toplam kayıt sayısı:', kayitlar.length);
  console.log('🔍 SERVICE - İlk kayıt keys:', kayitlar[0] ? Object.keys(kayitlar[0]) : 'yok');
  console.log('🔍 SERVICE - İlk kayıt kod:', kayitlar[0]?.kod);
  console.log('🔍 SERVICE - İlk kayıt bolumKod:', kayitlar[0]?.bolumKod);

  const requestBody = { kayitlar };
  console.log('🔍 SERVICE - Request body:', JSON.stringify(requestBody, null, 2));

  const { data } = await apiClient.post('/courses/import', requestBody);
  console.log('🔍 SERVICE - API yanıtı:', JSON.stringify(data, null, 2));
  return data;
};

export const useImportCourses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importCourses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteCourse = async (id: string) => {
  const { data } = await apiClient.delete(`/courses/${id}`);
  return data;
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateCourseDto {
  kod?: string;
  ad?: string;
  sinif?: number;
  donem?: Donem;
  bolumId?: string;
  kredi?: number;
  ogrenciKapasitesi?: number;
}

export const updateCourse = async (id: string, dto: UpdateCourseDto) => {
  console.log('🔍 SERVICE - updateCourse çağrıldı');
  console.log('🔍 SERVICE - ID:', id);
  console.log('🔍 SERVICE - Gönderilecek DTO:', JSON.stringify(dto, null, 2));
  console.log('🔍 SERVICE - DTO ogrenciKapasitesi:', dto.ogrenciKapasitesi);
  console.log('🔍 SERVICE - DTO ogrenciKapasitesi type:', typeof dto.ogrenciKapasitesi);
  const { data } = await apiClient.patch(`/courses/${id}`, dto);
  console.log('🔍 SERVICE - API yanıtı:', JSON.stringify(data, null, 2));
  return data;
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCourseDto }) =>
      updateCourse(id, dto),
    onSuccess: (data) => {
      console.log('🔍 SERVICE - useUpdateCourse onSuccess:', JSON.stringify(data, null, 2));
      console.log('🔍 SERVICE - useUpdateCourse onSuccess ogrenciKapasitesi:', data?.veri?.ogrenciKapasitesi);
      // Cache'i invalidate et
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      console.log('🔍 SERVICE - Cache invalidate edildi');
    },
  });
};

