import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailAPI } from '@/utils/api';

export const useEmails = () => {
  return useQuery({
    queryKey: ['emails'],
    queryFn: emailAPI.getAll,
  });
};

export const useEmail = (id) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailAPI.create,
    onSuccess: (newEmail) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
};