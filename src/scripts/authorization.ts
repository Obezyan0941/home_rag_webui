import {
  type SignInRequestInterface,
  type SignInResponse,
  type SignUpResponse
} from "./types"
import { fetchJson } from "./requests";
import { useMutation } from "@tanstack/react-query";


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
