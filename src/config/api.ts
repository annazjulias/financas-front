
import { auth } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const token = await user.getIdToken();

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : typeof data === "string" && data
          ? data
          : "Erro ao comunicar com a API.";

    throw new Error(message);
  }

  return data;
}
