import { globalapi } from "../../assets/api/globalapi";

export const loginRequest = async (email, senha) => {
  const response = await globalapi.get("/Usuario");

  const usuarios = response.data;

  const usuarioEncontrado = usuarios.find(
    (u) =>
      u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      u.senha === senha
  );

  if (!usuarioEncontrado) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!usuarioEncontrado.statusUsuario) {
    throw new Error("USER_INACTIVE");
  }

  return usuarioEncontrado;