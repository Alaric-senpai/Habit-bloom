// lib/instant/db.ts
import { init } from '@instantdb/react-native';
import schema, { AppSchema } from '@/instant.schema';
// import Store from '@instantdb/react-native-mmkv';

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID!;

export const db = init<AppSchema>({ 
  appId: APP_ID,
  schema,
//   Store:Store
});


// db.

// Auth helpers
export const auth = {
//   signIn: (email: string, password: string) => 
//     // db.auth.,

  
//   signUp: (email: string, password: string) => 
//     db.auth.signUpWithEmailAndPassword(email, password),
  
  signOut: () => db.auth.signOut(),
  
//   getUser: () => db.auth.getUser(),
  
//   isAuthenticated: () => db.auth.,
};

// Export typed transaction helper
export const tx = db.tx;

export default db;