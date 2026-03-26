const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(typeof window !== "undefined" && localStorage.getItem("tickr_token")
        ? { Authorization: `Bearer ${localStorage.getItem("tickr_token")}` }
        : {}),
    },
    credentials: "include", // important for auth (cookies)
  });

  // Handle errors globally
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
};
