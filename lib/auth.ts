import { api } from "./api/api";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "admin" | "agent" | "customer";
  sector?: string;
}

export const login = (data: { email: string; password: string }) => {
  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const signup = (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return api("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
