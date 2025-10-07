// /lib/apiClient.ts
import axios, { AxiosInstance, AxiosError } from "axios";

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends HttpOnly refresh cookie automatically
});

export function setupApiClient(
  getAccessToken: () => string | null,
  setAccessToken: (token: string) => void,
  logout: () => Promise<void>
) {
  const processQueue = (error: any, token?: string) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    failedQueue = [];
  };

  apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers!["Authorization"] = `Bearer ${token}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError & { config: any }) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const res = await apiClient.post("/auth/refresh");
          const newToken = res.data.accessToken;
          setAccessToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err, null);
          await logout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
}
