"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, User } from "@/lib/auth";

const STORAGE_KEYS = {
    TOKEN: "tickr_token",
    USER: "tickr_user",
};

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
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== "undefined") {
            const data = localStorage.getItem(STORAGE_KEYS.USER);
            try {
                return data ? JSON.parse(data) : null;
            } catch {
                return null;
            }
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(STORAGE_KEYS.TOKEN);
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // 🔹 Login
    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const res = await loginApi(credentials);
            const { access_token, user: userData } = res;

            const normalizedUser = { ...userData, id: userData.id || userData._id };

            // Save state
            setToken(access_token);
            setUser(normalizedUser);

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));

            // 🔥 Role-based redirect (FINAL FIX)
            const roleRoutes: Record<string, string> = {
                admin: "/admin",
                agent: "/agent",
                customer: "/user",
            };

            const role = String(userData.role || "").toLowerCase().trim();
            const route = roleRoutes[role] || "/";

            console.log(`[Auth] Role: '${role}' → Redirecting to '${route}'`);

            router.replace(route); // ✅ single redirect (clean)

        } catch (error) {
            console.error("Login attempt failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // 🔹 Logout
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        router.replace("/login");
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

// 🔹 Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};