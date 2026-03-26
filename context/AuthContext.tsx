"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi } from "@/lib/auth";

const STORAGE_KEYS = {
    TOKEN: "tickr_token",
    USER: "tickr_user",
};

interface User {
    id: string;
    name?: string;
    email: string;
    role: "admin" | "agent" | "customer";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialization: load from local storage
    useEffect(() => {
        // Only run this in the browser
        if (typeof window !== "undefined") {
            const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

            if (savedToken && savedUser) {
                try {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                } catch (err) {
                    console.error("Auth initialization failed:", err);
                    // Clean up corrupted storage
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.USER);
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const res = await loginApi(credentials);
            const { access_token, user: userData } = res;

            // Update state
            setToken(access_token);
            setUser(userData);

            // Persist to storage
            localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            // Role-based routing (Optimised with a map)
            const roleRoutes = {
                admin: "/admin",
                agent: "/agent/dashboard",
                customer: "/user",
            };

            router.push(roleRoutes[userData.role as keyof typeof roleRoutes] || "/");
        } catch (error) {
            console.error("Login attempt failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
