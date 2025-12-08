import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Department } from '@sinav/shared';

type DepartmentsResponse = {
  veriler: Department[];
  toplam: number;
};

export const fetchDepartments = async (params?: { fakulteId?: string }) => {
  const queryParams: Record<string, string | number> = {
    limit: 200,
  };
  if (params?.fakulteId) {
    queryParams.fakulteId = params.fakulteId;
  }
  
  const { data } = await apiClient.get<DepartmentsResponse>('/departments', {
    params: queryParams,
  });
  return data.veriler;
};

export const useDepartments = (fakulteId?: string) =>
  useQuery({
    queryKey: ['departments', fakulteId],
    queryFn: () => fetchDepartments({ fakulteId }),
  });

export interface CreateDepartmentDto {
  ad: string;
  kod: string;
  fakulteId: string;
}

export const createDepartment = async (dto: CreateDepartmentDto) => {
  const { data } = await apiClient.post('/departments', dto);
  return data;
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface ImportDepartmentItemDto {
  ad: string;
  kod: string;
  fakulteId?: string;
  fakulteKod?: string;
  fakulteAd?: string;
}

export const importDepartments = async (kayitlar: ImportDepartmentItemDto[]) => {
  // Debug: Backend'e gönderilen veriyi kontrol et
  console.log('🔍 SERVICE DEBUG - importDepartments çağrıldı');
  console.log('🔍 SERVICE DEBUG - Parametre type:', typeof kayitlar);
  console.log('🔍 SERVICE DEBUG - Parametre Array mi?', Array.isArray(kayitlar));
  console.log('🔍 SERVICE DEBUG - Kayıt sayısı:', kayitlar?.length || 0);
  console.log('🔍 SERVICE DEBUG - Kayıtlar (raw):', kayitlar);
  console.log('🔍 SERVICE DEBUG - Kayıtlar (JSON):', JSON.stringify(kayitlar, null, 2));
  console.log('🔍 SERVICE DEBUG - İlk 3 kayıt:', kayitlar?.slice(0, 3));
  
  if (!kayitlar) {
    console.error('🔍 SERVICE ERROR - kayitlar null/undefined!');
    throw new Error('İçe aktarılacak veri bulunamadı.');
  }
  
  if (!Array.isArray(kayitlar)) {
    console.error('🔍 SERVICE ERROR - kayitlar Array değil!', typeof kayitlar, kayitlar);
    throw new Error('Geçersiz veri formatı: Array bekleniyor.');
  }
  
  if (kayitlar.length === 0) {
    console.error('🔍 SERVICE ERROR - kayitlar boş array!');
    throw new Error('İçe aktarılacak veri bulunamadı.');
  }
  
  // Her kaydı kontrol et
  kayitlar.forEach((kayit, index) => {
    console.log(`🔍 SERVICE DEBUG - Kayıt ${index + 1} kontrol:`, JSON.stringify(kayit, null, 2));
    if (!kayit || typeof kayit !== 'object') {
      console.error(`🔍 SERVICE ERROR - Geçersiz kayıt ${index + 1}:`, kayit);
      throw new Error(`Satır ${index + 1}: Geçersiz veri formatı.`);
    }
    if (Object.keys(kayit).length === 0) {
      console.error(`🔍 SERVICE ERROR - Boş kayıt ${index + 1}:`, kayit);
      throw new Error(`Satır ${index + 1}: Boş kayıt.`);
    }
    if (!kayit.ad || !kayit.kod) {
      console.error(`🔍 SERVICE ERROR - Eksik veri ${index + 1}:`, {
        kayit,
        keys: Object.keys(kayit),
        values: Object.values(kayit),
        ad: kayit.ad,
        kod: kayit.kod
      });
      throw new Error(`Satır ${index + 1}: "ad" veya "kod" eksik. Veri: ${JSON.stringify(kayit)}`);
    }
  });
  
  console.log('🔍 SERVICE DEBUG - Tüm kontroller geçti, API çağrısı yapılıyor...');
  console.log('🔍 SERVICE DEBUG - Gönderilecek veri:', JSON.stringify({ kayitlar }, null, 2));
  
  const { data } = await apiClient.post('/departments/import', { kayitlar });
  console.log('🔍 SERVICE DEBUG - API yanıtı:', data);
  return data;
};

export const useImportDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importDepartments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteDepartment = async (id: string) => {
  const { data } = await apiClient.delete(`/departments/${id}`);
  return data;
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateDepartmentDto {
  ad?: string;
  kod?: string;
  fakulteId?: string;
}

export const updateDepartment = async (id: string, dto: UpdateDepartmentDto) => {
  const { data } = await apiClient.patch(`/departments/${id}`, dto);
  return data;
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepartmentDto }) =>
      updateDepartment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

