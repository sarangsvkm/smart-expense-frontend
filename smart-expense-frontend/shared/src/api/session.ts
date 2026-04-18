import type { JwtResponse } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface StorageProvider {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

const canUseStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

let customProvider: StorageProvider | null = null;

export const setStorageProvider = (provider: StorageProvider) => {
  customProvider = provider;
};

export let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

const getProvider = (): StorageProvider | null => {
  if (customProvider) return customProvider;
  if (canUseStorage()) return localStorage;
  return null;
};

export const getStoredToken = async (): Promise<string | null> => {
  const provider = getProvider();
  if (!provider) return null;
  return await Promise.resolve(provider.getItem(TOKEN_KEY));
};

export const storeToken = async (token: string): Promise<void> => {
  const provider = getProvider();
  if (!provider) return;
  await Promise.resolve(provider.setItem(TOKEN_KEY, token));
};

export const storeSession = async (session: JwtResponse): Promise<void> => {
  const provider = getProvider();
  if (!provider) return;
  await Promise.resolve(provider.setItem(TOKEN_KEY, session.token));
  await Promise.resolve(provider.setItem(USER_KEY, JSON.stringify(session)));
};

export const clearSession = async (): Promise<void> => {
  const provider = getProvider();
  if (!provider) return;
  await Promise.resolve(provider.removeItem(TOKEN_KEY));
  await Promise.resolve(provider.removeItem(USER_KEY));
};

