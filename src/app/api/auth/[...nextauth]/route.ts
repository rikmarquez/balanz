import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const handler = NextAuth({
  providers: [
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
            await db.insert(users).values({
              email: user.email!,
              name: user.name!,
              clerkId: user.id, // Usamos el ID de Google como identificador
            });
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
          session.user.id = dbUser[0].id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }