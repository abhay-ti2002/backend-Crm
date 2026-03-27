const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (endpoint: string, options: RequestInit = {}) => {
  if (!BASE_URL) {
    console.warn("[API] NEXT_PUBLIC_API_URL is undefined! Using fallback or check .env.local");
  }

  const url = `${BASE_URL || ""}${endpoint}`;
  console.log(`[API] Fetching: ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(typeof window !== "undefined" && localStorage.getItem("tickr_token")
        ? { Authorization: `Bearer ${localStorage.getItem("tickr_token")}` }
        : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error(`[API] Error response from ${endpoint}:`, error);
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
};
