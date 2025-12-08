import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Room, DerslikTip } from '@sinav/shared';

type RoomsResponse = {
  veriler: Room[];
  toplam: number;
};

export const fetchRooms = async () => {
  const queryParams: Record<string, string | number> = {
    limit: 200,
  };
  
  const { data } = await apiClient.get<RoomsResponse>('/rooms', {
    params: queryParams,
  });
  return data.veriler;
};

export const useRooms = () =>
  useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  });

export interface CreateRoomDto {
  ad: string;
  bina: string;
  tip: DerslikTip;
  kapasite: number;
}

export const createRoom = async (dto: CreateRoomDto) => {
  const { data } = await apiClient.post('/rooms', dto);
  return data;
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const importRooms = async (kayitlar: CreateRoomDto[]) => {
  const { data } = await apiClient.post('/rooms/import', { kayitlar });
  return data;
};

export const useImportRooms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importRooms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const deleteRoom = async (id: string) => {
  const { data } = await apiClient.delete(`/rooms/${id}`);
  return data;
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export interface UpdateRoomDto {
  ad?: string;
  bina?: string;
  tip?: DerslikTip;
  kapasite?: number;
}

export const updateRoom = async (id: string, dto: UpdateRoomDto) => {
  const { data } = await apiClient.patch(`/rooms/${id}`, dto);
  return data;
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomDto }) =>
      updateRoom(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

