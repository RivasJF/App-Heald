import { useMutation } from '@tanstack/react-query'
import { requestCode } from "../../services/userServices"

export const useRequestCode = () => {
  return useMutation({
    mutationFn: requestCode,
  })
}
