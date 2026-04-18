import apiClient from './client';
import { clearSession, storeSession } from './session';
import type { JwtResponse, LoginRequest, MessageResponse, SignupRequest } from '../types';

export const signIn = async (payload: LoginRequest) => {
  const response = await apiClient.post<JwtResponse>('/auth/signin', payload);
  await storeSession(response.data);
  return response.data;
};

export const signUp = async (payload: SignupRequest) => {
  const response = await apiClient.post<MessageResponse>('/auth/signup', payload);
  return response.data;
};

export const signOut = async () => {
  await clearSession();
};

