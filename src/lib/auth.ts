import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { initializeUserData } from './services/user-setup'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Verificar las credenciales específicas del administrador
        if (credentials.email === 'rik@rikmarquez.com' && credentials.password === 'Acceso979971') {
          // Buscar o crear el usuario administrador
          let existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1)

          if (existingUser.length === 0) {
            // Crear el usuario administrador si no existe
            const newUser = await db.insert(users).values({
              email: credentials.email,
              name: 'Rik Marquez',
              clerkId: 'rik-admin-user',
            }).returning()

            // Inicializar datos por defecto
            await initializeUserData(newUser[0].id)
            existingUser = newUser
          }

          return {
            id: existingUser[0].id,
            email: existingUser[0].email,
            name: existingUser[0].name,
          }
        }

        return null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email!))
            .limit(1);

          if (existingUser.length === 0) {
            // Crear nuevo usuario
            const newUser = await db.insert(users).values({
              email: user.email!,
              name: user.name!,
              clerkId: user.id, // Mantenemos la columna clerkId para compatibilidad
            }).returning();

            // Inicializar datos por defecto para el nuevo usuario
            await initializeUserData(newUser[0].id);
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Obtener el usuario de la BD
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser.length > 0) {
          // Crear un nuevo objeto user con el id
          session.user = {
            ...session.user,
            id: dbUser[0].id
          };
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  // Check if user exists in our database
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (existingUser.length === 0) {
    return null;
  }

  return existingUser[0];
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}