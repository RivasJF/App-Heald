import { useQuery } from '@tanstack/react-query'
import { getProfile } from '../../services/authService'

export const useProfile = () => {
  return useQuery({
    queryKey: ['profileClient'],
    queryFn: () => getProfile()
  })
}