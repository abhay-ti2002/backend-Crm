import { api } from "./api";

/**
 * Shape of the Request Payload for Signup
 */
export interface SignupRequest {
    name: string;
    email: string;
    password?: string; // Optional if you also support OAuth, but required for standard signup
}

/**
 * Shape of the Signed Up User Object
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

/**
 * Shape of the Response from the Signup API
 */
export interface SignupResponse {
    access_token: string;
    user: User;
}

/**
 * Creates a new user account
 * POST /auth/signup
 */
export async function signupApi(data: SignupRequest): Promise<SignupResponse> {
    return api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
