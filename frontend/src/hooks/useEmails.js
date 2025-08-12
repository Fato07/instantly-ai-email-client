import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailAPI } from '@/utils/api';

// Fetch all emails
export const useEmails = () => {
  return useQuery({
    queryKey: ['emails'],
    queryFn: emailAPI.getAll,
  });
};

// Fetch single email by ID
export const useEmail = (id) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailAPI.getById(id),
    enabled: !!id,
  });
};

// Create new email
export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailAPI.create,
    onSuccess: (newEmail) => {
      // Invalidate and refetch emails list
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      
      // Optionally, add the new email to the cache immediately
      queryClient.setQueryData(['emails'], (old) => {
        return old ? [newEmail, ...old] : [newEmail];
      });
    },
  });
};

// Delete email
export const useDeleteEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailAPI.delete,
    onSuccess: (_, deletedId) => {
      // Invalidate emails list
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      
      // Remove from cache
      queryClient.setQueryData(['emails'], (old) => {
        return old ? old.filter(email => email.id !== deletedId) : [];
      });
    },
  });
};