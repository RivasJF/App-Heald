import { useMutation } from '@tanstack/react-query';
import { validateCodeResetPassword } from '../../services/userServices';

export const useValidateCodeResetPassword = () => {
  return useMutation({
    mutationFn: validateCodeResetPassword,
  });
};