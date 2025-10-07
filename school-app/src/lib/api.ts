import { apiClient } from './apiClient';

export const fetchProfile = async () => {
  const { data } = await apiClient.get('/api/auth/profile');
  return data;
};
