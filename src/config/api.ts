import { auth } from "./firebase";

const API_URL = "http://localhost:3001";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const token = await user.getIdToken();

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Só envia Content-Type quando existe um body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Erro ao comunicar com a API."
    );
  }

  return data;
}