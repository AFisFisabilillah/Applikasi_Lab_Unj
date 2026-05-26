import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/types/User';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export type StoredAuthSession = {
  token: string | null;
  user: User | null;
};

export async function saveAuthSession(token: string, user: User) {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_USER_KEY, JSON.stringify(user)],
  ]);
}

export async function getStoredAuthSession(): Promise<StoredAuthSession> {
  const [token, serializedUser] = await AsyncStorage.multiGet([
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
  ]);

  const storedToken = token[1];
  const storedUser = serializedUser[1];

  return {
    token: storedToken ?? null,
    user: storedUser ? (JSON.parse(storedUser) as User) : null,
  };
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
}
