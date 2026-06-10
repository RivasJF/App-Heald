import { useMutation } from '@tanstack/react-query'
import { registerUser } from "../../services/userServices"

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  })
}

export const useRegiter = useRegister