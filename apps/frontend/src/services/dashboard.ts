import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardStats {
  sinavlar: {
    toplam: number;
    planlandi: number;
    planlanmadi: number;
  };
  fakulteler: number;
  bolumler: number;
  derslikler: number;
  dersler: number;
  ogretimUyeleri: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  } catch (error: any) {
    console.error('Dashboard stats fetch error:', error);
    console.error('API URL:', apiClient.defaults.baseURL);
    console.error('Full URL:', `${apiClient.defaults.baseURL}/dashboard/stats`);
    throw error;
  }
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });
};

