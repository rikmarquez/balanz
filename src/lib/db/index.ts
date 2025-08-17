import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Configuración optimizada para desarrollo y producción
const connectionConfig = {
  prepare: false,
  max: 10, // Máximo 10 conexiones en el pool
  idle_timeout: 20, // Cerrar conexiones inactivas después de 20 segundos
  max_lifetime: 60 * 30, // Renovar conexiones cada 30 minutos
  transform: {
    undefined: null
  }
};

// Para desarrollo: evitar recrear conexiones en hot reload
let globalClient: postgres.Sql<Record<string, unknown>>;

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar una conexión global para evitar "too many clients"
  if (!(global as any).pgClient) {
    (global as any).pgClient = postgres(process.env.DATABASE_URL, connectionConfig);
  }
  globalClient = (global as any).pgClient;
} else {
  // En producción, crear una nueva conexión
  globalClient = postgres(process.env.DATABASE_URL, connectionConfig);
}

export const db = drizzle(globalClient, { schema });