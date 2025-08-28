import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Formatear con configuración específica de México: punto decimal, coma para miles
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  // Convertir punto decimal a coma para miles y mantener punto para decimales
  const parts = formatted.split('.');
  const integerPart = parts[0].replace(/,/g, ','); // Mantener comas para miles
  const decimalPart = parts[1];
  
  return `$${integerPart}.${decimalPart}`;
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

// Función para formatear fechas localmente sin problemas de timezone
export function formatLocalDate(dateString: string, options: {
  day?: '2-digit' | 'numeric',
  month?: '2-digit' | 'short' | 'long' | 'numeric', 
  year?: 'numeric' | '2-digit'
} = { day: '2-digit', month: 'short', year: 'numeric' }): string {
  // Parsear la fecha como local (YYYY-MM-DD) evitando conversión UTC
  const [year, month, day] = dateString.split('T')[0].split('-').map(num => parseInt(num, 10));
  const localDate = new Date(year, month - 1, day); // month is 0-indexed
  
  return localDate.toLocaleDateString('es-ES', options);
}