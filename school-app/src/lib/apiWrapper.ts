// /lib/apiWrapper.ts
import { AxiosRequestConfig, AxiosError } from "axios";
import { apiClient } from "./apiClient";

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    const axiosError = err as AxiosError;
    if (axiosError.response) {
      console.error("[API Wrapper] Error:", axiosError.response.status, axiosError.response.data);
      throw new ApiError(axiosError.message, axiosError.response.status, axiosError.response.data);
    } else {
      console.error("[API Wrapper] Generic Error:", err);
      throw new ApiError(axiosError.message);
    }
  }
}

export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  apiCall(() => apiClient.get<T>(url, config).then((res) => res.data));

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCall(() => apiClient.post<T>(url, data, config).then((res) => res.data));
