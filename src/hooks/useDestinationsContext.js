import { useContext } from 'react';
import { DestinationsContext } from '../context/DestinationsContext';

export function useDestinationsContext() {
  const context = useContext(DestinationsContext);
  if (!context) {
    throw new Error('useDestinationsContext debe utilizarse dentro de un DestinationsProvider');
  }
  return context;
}
