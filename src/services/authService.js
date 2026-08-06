import { globalapi } from "../../assets/api/globalapi";

function normalizeUsuario(usuario) {
  return {
    id: usuario?.id,
    nome: usuario?.nome,
    username: usuario?.username,
    email: usuario?.username,
    nivelAcesso: usuario?.nivelAcesso,
    statusUsuario: usuario?.statusUsuario,
  };
}

export const loginRequest = async (email, senha) => {
  const params = new URLSearchParams();
  params.append("username", String(email ?? "").trim().toLowerCase());
  params.append("password", String(senha ?? ""));

  try {
    await globalapi.post("login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      withCredentials: true,
    });

    const response = await globalapi.get("usuario/me", { withCredentials: true });
    return normalizeUsuario(response.data);
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new Error("INVALID_CREDENTIALS");
    }

    throw error;
  }
};
