import React, { createContext, useState, useCallback } from 'react';

export const CitaContext = createContext();

export function CitaProvider({ children }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Nuevo estado para la ubicación

  const resetCita = useCallback(() => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null); // Limpiar también la ubicación
  }, []);

  const value = {
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedLocation,
    setSelectedLocation,
    resetCita,
  };

  return (
    <CitaContext.Provider value={value}>
      {children}
    </CitaContext.Provider>
  );
}
