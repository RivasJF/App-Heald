import { useMutation } from '@tanstack/react-query';
import { sendCodeResetPassword } from '../../services/userServices';

export const useSendCodeResetPassword = () => {
  return useMutation({
    mutationFn: sendCodeResetPassword,
  });
};