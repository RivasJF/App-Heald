import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../services/userServices';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};