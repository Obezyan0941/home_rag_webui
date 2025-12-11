import {
  type SignInRequestInterface,
  type SignInResponse,
  type SignUpResponse
} from "./types"
import { useMutation } from "@tanstack/react-query";

let apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:1024',
  timeout: 5000,
};

export function setApiConfig(config: Partial<ApiConfig>) {
  apiConfig = { ...apiConfig, ...config };
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
}

export async function fetchJson<TReq, TRes>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: TReq,
  config: Partial<ApiConfig> = {}
): Promise<TRes> {
  const finalConfig = { ...apiConfig, ...config };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (data !== undefined && !['GET', 'DELETE'].includes(method)) {
    (requestOptions as any).body = JSON.stringify(data);
  }

  try {
    const url = `${finalConfig.baseUrl}${path}`;
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const SignInRequest = (data: SignInRequestInterface) =>
  fetchJson<SignInRequestInterface, SignInResponse>('/signin', 'POST', data);

export const useLogin = () => {
    return useMutation({
        mutationFn: (credentials: { email: string; password: string; }) => 
            SignInRequest({
              email: credentials.email,
              password: credentials.password,
            }),
        onSuccess: async (data: SignInResponse) => {
            if (data === undefined) {
                throw new Error("Error in login request: no data received");
            }
            
            console.log("Successfully logged in!");
        },
        onError: (error: Error) => {
            console.error(error.message);
        },
    });
};

export const SignUpRequest = (data: SignInRequestInterface) =>
  fetchJson<SignInRequestInterface, SignUpResponse>('/signup', 'POST', data);

export const useSignUp = () => {
    return useMutation({
        mutationFn: (credentials: { email: string; password: string; }) => 
            SignUpRequest({
              email: credentials.email,
              password: credentials.password,
            }),
        onSuccess: async (data: SignUpResponse) => {
            if (data === undefined) {
                throw new Error("Error in login request: no data received");
            }
            
            console.log("Successfully signed up!");
        },
        onError: (error: Error) => {
            console.error(error.message);
        },
    });
};
