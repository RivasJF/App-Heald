import { create } from 'zustand'

export const useRegisterStore = create((set) => ({
  // Estado
  name: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  role: '', // 'CLIENT' o 'DOCTOR'

  // Acciones
  setName: (input) => set({ name: input }),
  setEmail: (input) => set({ email: input }),
  setTelefono: (input) => set({ telefono: input }),
  setPassword: (input) => set({ password: input }),
  setConfirmPassword: (input) => set({ confirmPassword: input }),
  setBirthDate: (input) => set({ birthDate: input }),
  setRole: (input) => set({ role: input }),

  // Acción para establecer múltiples campos a la vez
  setRegistrationData: (data) => set(data),

  // Acción para resetear el store
  reset: () =>
    set({
      name: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      role: '',
    }),
}))