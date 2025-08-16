import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { initializeUserData } from './services/user-setup';

export async function getCurrentUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Check if user exists in our database
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (existingUser.length === 0) {
    try {
      // Create user in our database
      const newUser = await db
        .insert(users)
        .values({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress || '',
        })
        .returning();

      // Initialize default data for new user
      await initializeUserData(newUser[0].id);

      return newUser[0];
    } catch (error: any) {
      // If user already exists (race condition), try to fetch again
      if (error.message?.includes('duplicate key value')) {
        console.log('User already exists, fetching existing user...');
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, user.id))
          .limit(1);
        
        if (existingUser.length > 0) {
          return existingUser[0];
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  return existingUser[0];
}

export async function requireAuth() {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}