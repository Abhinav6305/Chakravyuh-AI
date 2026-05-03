const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function saveSession(auth) {
  localStorage.setItem("token", auth.access_token);
  localStorage.setItem("bank_id", auth.bank_id);
  localStorage.setItem("bank_name", auth.bank_name);
  localStorage.setItem("branch_name", auth.branch);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("bank_id");
  localStorage.removeItem("bank_name");
  localStorage.removeItem("branch_name");
}

export function getBankProfile() {
  if (typeof window === "undefined") {
    return { bankName: "Bank", branch: "Fraud command center" };
  }

  return {
    bankName: localStorage.getItem("bank_name") || "Bank",
    branch: localStorage.getItem("branch_name") || "Fraud command center",
    bankId: localStorage.getItem("bank_id") || ""
  };
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data.detail || data || "Request failed");
  }

  return data;
}
